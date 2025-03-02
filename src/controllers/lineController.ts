import { WebhookEvent, MessageEvent, TextMessage, PostbackEvent } from '@line/bot-sdk';
import { client } from '../config/line';
import { ContextManager } from '../services/ContextManager';
import { RichMenuManager } from '../services/RichMenuManager';
import { TemplateManager } from '../services/TemplateManager';
import { Message } from '../types/context';
import { differenceInMinutes } from 'date-fns';

const contextManager = new ContextManager();
const richMenuManager = new RichMenuManager(client);

export async function handleEvent(event: WebhookEvent): Promise<void> {
  try {
    switch (event.type) {
      case 'message':
        if (event.message.type === 'text') {
          await handleMessageEvent(event);
        }
        break;
      case 'postback':
        await handlePostbackEvent(event);
        break;
      case 'follow':
        await handleFollowEvent(event);
        break;
    }
  } catch (error) {
    console.error('Error handling event:', error);
    if ('replyToken' in event) {
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'すみません、エラーが発生しました。もう一度お試しください。'
      });
    }
  }
}

async function handleFollowEvent(event: WebhookEvent): Promise<void> {
  if (event.type !== 'follow') return;
  
  const userId = event.source.userId!;
  await richMenuManager.switchToMainMenu(userId);
  
  if ('replyToken' in event) {
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'フォローありがとうございます！\n下のメニューから「会話を始める」を選んでください。'
    });
  }
}

async function handleMessageEvent(event: MessageEvent): Promise<void> {
  if (event.message.type !== 'text') return;

  const userId = event.source.userId!;
  const messageText = event.message.text;

  try {
    let context = await contextManager.getContext(userId);
    
    if (isMarkdownFile(messageText)) {
      await handleMarkdownRestore(event);
      return;
    }

    if (!context) {
      context = await contextManager.createContext(userId);
      await sendInitialMessage(event);
      return;
    }

    const message: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date(event.timestamp)
    };
    await contextManager.addMessage(userId, message);

    const response = await generateContextBasedResponse(context, messageText);
    await client.replyMessage(event.replyToken, response);

    const botMessage: Message = {
      role: 'bot',
      content: response.text,
      timestamp: new Date()
    };
    await contextManager.addMessage(userId, botMessage);

  } catch (error) {
    console.error('Error handling message:', error);
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'すみません、エラーが発生しました。もう一度お試しください。'
    });
  }
}

async function handlePostbackEvent(event: PostbackEvent): Promise<void> {
  const userId = event.source.userId!;
  const data = event.postback.data;

  try {
    switch (true) {
      case data === 'start_conversation':
        await handleStartConversation(event);
        break;
      case data === 'set_alcohol_level':
        await client.replyMessage(event.replyToken, TemplateManager.createAlcoholLevelTemplate());
        break;
      case data === 'change_topic':
        await client.replyMessage(event.replyToken, TemplateManager.createTopicTemplate());
        break;
      case data === 'help':
        await handleHelp(event);
        break;
      case data === 'deep_dive':
        await handleDeepDive(event);
        break;
      case data === 'end_conversation':
        await handleEndConversation(event);
        break;
      case data.startsWith('alcohol_'):
        const level = parseInt(data.split('_')[1]);
        await handleAlcoholLevelSelection(event, level);
        break;
      case data.startsWith('topic_'):
        const topic = data.split('_')[1];
        await handleTopicSelection(event, topic);
        break;
    }
  } catch (error) {
    console.error('Error handling postback:', error);
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'すみません、エラーが発生しました。もう一度お試しください。'
    });
  }
}

async function handleStartConversation(event: PostbackEvent): Promise<void> {
  const userId = event.source.userId!;
  await richMenuManager.switchToConversationMenu(userId);
  await client.replyMessage(event.replyToken, TemplateManager.createAlcoholLevelTemplate());
}

async function handleHelp(event: PostbackEvent): Promise<void> {
  const helpMessage = {
    type: 'text',
    text: `💡 使い方ガイド

1️⃣ 「会話を始める」を選択
2️⃣ お酒レベルを設定
3️⃣ 話題を選択
4️⃣ 自由に会話を楽しむ

📝 その他の機能
・「話を深める」で詳しい話を聞けます
・「話題を変える」で新しい話題に切り替えられます
・会話は30分で自動的に終了し、記録が保存されます
・保存された記録を送ると、前回の続きから話せます

❓ 困ったときは
・「会話を終える」で強制終了できます
・もう一度このヘルプを見るには「ヘルプ」を選択してください`
  };

  await client.replyMessage(event.replyToken, helpMessage);
}

async function handleDeepDive(event: PostbackEvent): Promise<void> {
  const userId = event.source.userId!;
  const context = await contextManager.getContext(userId);
  
  if (!context) {
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '申し訳ありません。会話を開始してからお試しください。'
    });
    return;
  }

  const lastMessage = context.context.lastMessage;
  const response = `${lastMessage}について、もう少し詳しく聞かせていただけますか？\n例えば：\n・きっかけは何でしたか？\n・どんな気持ちでしたか？\n・その後どうなりましたか？`;

  await client.replyMessage(event.replyToken, {
    type: 'text',
    text: response
  });
}

async function handleEndConversation(event: PostbackEvent): Promise<void> {
  const userId = event.source.userId!;
  const context = await contextManager.getContext(userId);
  
  if (!context) {
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '会話はすでに終了しています。'
    });
    return;
  }

  const startTime = context.context.messages[0]?.timestamp || context.context.timestamp;
  const duration = differenceInMinutes(new Date(), startTime);
  const messageCount = context.context.messages.length;

  const markdown = await contextManager.archiveContext(userId);
  await richMenuManager.switchToMainMenu(userId);

  await client.replyMessage(event.replyToken, [
    TemplateManager.createSessionEndTemplate(duration, messageCount),
    {
      type: 'text',
      text: markdown
    }
  ]);
}

async function handleAlcoholLevelSelection(event: PostbackEvent, level: number): Promise<void> {
  const userId = event.source.userId!;
  
  try {
    await contextManager.updateContext(userId, { alcoholLevel: level });
    await client.replyMessage(event.replyToken, [
      {
        type: 'text',
        text: `お酒レベルを「${getAlcoholLevelText(level)}」に設定しました！`
      },
      TemplateManager.createTopicTemplate()
    ]);
  } catch (error) {
    throw new Error('Failed to handle alcohol level selection');
  }
}

async function handleTopicSelection(event: PostbackEvent, topic: string): Promise<void> {
  const userId = event.source.userId!;
  const topicNames: { [key: string]: string } = {
    work: '仕事',
    hobby: '趣味',
    romance: '恋愛',
    other: 'その他'
  };

  try {
    await contextManager.updateContext(userId, { topic: topicNames[topic] });
    await richMenuManager.switchToConversationMenu(userId);
    
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: `${topicNames[topic]}について話しましょう！\nどんなことがありましたか？`
    });
  } catch (error) {
    throw new Error('Failed to handle topic selection');
  }
}

async function sendInitialMessage(event: MessageEvent): Promise<void> {
  await client.replyMessage(event.replyToken, [
    {
      type: 'text',
      text: 'こんにちは！お酒は飲まれていますか？'
    },
    TemplateManager.createAlcoholLevelTemplate()
  ]);
}

async function handleMarkdownRestore(event: MessageEvent): Promise<void> {
  try {
    const userId = event.source.userId!;
    const markdown = event.message.text;
    await contextManager.restoreContext(userId, markdown);
    await richMenuManager.switchToConversationMenu(userId);

    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '🔄 前回の会話コンテキストを復元しました！\n続きの会話を始めましょう。'
    });
  } catch (error) {
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '申し訳ありません。コンテキストの復元に失敗しました。'
    });
  }
}

async function generateContextBasedResponse(context: any, message: string): Promise<TextMessage> {
  const alcoholLevel = context.context.alcoholLevel;
  const topic = context.context.topic;
  
  let response = '';
  
  if (topic) {
    response = `${topic}について、${message}なんですね。\n`;
    if (alcoholLevel >= 2) {
      response += 'もっと詳しく聞かせてください！';
    } else {
      response += 'どんな風に感じましたか？';
    }
  } else {
    response = `${message}について、もう少し詳しく教えていただけますか？`;
  }

  return {
    type: 'text',
    text: response
  };
}

function isMarkdownFile(text: string): boolean {
  return text.startsWith('# 会話セッション記録') && text.includes('session_metadata');
}

function getAlcoholLevelText(level: number): string {
  switch (level) {
    case 0:
      return '飲んでいない';
    case 1:
      return '少し飲んだ';
    case 2:
      return 'まあまあ飲んだ';
    case 3:
      return 'かなり飲んだ';
    default:
      return '不明';
  }
} 