import { FlexMessage, FlexBubble, FlexComponent } from '@line/bot-sdk';

export class TemplateManager {
  public static createAlcoholLevelTemplate(): FlexMessage {
    return {
      type: 'flex',
      altText: 'お酒レベルを選択してください',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'お酒レベルを教えてください',
              weight: 'bold',
              size: 'lg'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          contents: [
            this.createAlcoholButton(0, '飲んでいない', '🚫'),
            this.createAlcoholButton(1, '少し飲んだ', '🍺'),
            this.createAlcoholButton(2, 'まあまあ飲んだ', '🍺🍺'),
            this.createAlcoholButton(3, 'かなり飲んだ', '🍺🍺🍺')
          ]
        }
      }
    };
  }

  public static createTopicTemplate(): FlexMessage {
    return {
      type: 'flex',
      altText: '話題を選んでください',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'どんな話題でお話ししましょうか？',
              weight: 'bold',
              size: 'lg'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          contents: [
            this.createTopicButton('work', '仕事の話', '💼'),
            this.createTopicButton('hobby', '趣味の話', '⚽'),
            this.createTopicButton('romance', '恋愛の話', '💕'),
            this.createTopicButton('other', 'その他', '💭')
          ]
        }
      }
    };
  }

  public static createSessionEndTemplate(duration: number, messageCount: number): FlexMessage {
    return {
      type: 'flex',
      altText: 'セッション終了',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '🕒 セッション終了',
              weight: 'bold',
              size: 'xl'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          contents: [
            {
              type: 'text',
              text: `${duration}分間の会話を終了します。\n会話の記録をお送りしますので保存してください。`,
              wrap: true
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'md',
              contents: [
                {
                  type: 'text',
                  text: '📝 会話の記録',
                  weight: 'bold'
                },
                {
                  type: 'text',
                  text: `・${messageCount}件のメッセージ`,
                  size: 'sm',
                  margin: 'sm'
                }
              ]
            },
            {
              type: 'text',
              text: '💡 このファイルを送信することで、この会話のコンテキストを再開できます',
              size: 'sm',
              margin: 'lg',
              color: '#666666',
              wrap: true
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'postback',
                label: '新しい会話を始める',
                data: 'start_new_session'
              },
              style: 'primary'
            }
          ]
        }
      }
    };
  }

  private static createAlcoholButton(level: number, label: string, emoji: string): FlexComponent {
    return {
      type: 'button',
      action: {
        type: 'postback',
        label: `${emoji} ${label}`,
        data: `alcohol_${level}`
      },
      style: 'secondary',
      height: 'sm'
    };
  }

  private static createTopicButton(topic: string, label: string, emoji: string): FlexComponent {
    return {
      type: 'button',
      action: {
        type: 'postback',
        label: `${emoji} ${label}`,
        data: `topic_${topic}`
      },
      style: 'secondary',
      height: 'sm'
    };
  }
} 