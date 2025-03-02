import { SessionMetadata } from '../types/context';
import * as yaml from 'yaml';

export function generateMarkdown(metadata: SessionMetadata): string {
  const yamlMetadata = yaml.stringify(metadata);

  const markdown = `# 会話セッション記録
<!-- セッション復元用メタデータ -->
<!--
session_metadata:
${yamlMetadata}
-->

## 基本情報
- セッションID: ${metadata.sessionId}
- 開始時刻: ${metadata.startTime.toLocaleString()}
- 終了時刻: ${metadata.endTime.toLocaleString()}

## コンテキスト情報
- お酒レベル: ${getAlcoholLevelEmoji(metadata.context.alcoholLevel)} ${getAlcoholLevelText(metadata.context.alcoholLevel)}
- 気分: ${metadata.context.mood}
- 話題: ${metadata.context.topic}

## 会話ログ
${generateConversationLog(metadata)}
`;

  return markdown;
}

function getAlcoholLevelEmoji(level: number): string {
  switch (level) {
    case 0:
      return '';
    case 1:
      return '🍺';
    case 2:
      return '🍺🍺';
    case 3:
      return '🍺🍺🍺';
    default:
      return '';
  }
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

function generateConversationLog(metadata: SessionMetadata): string {
  return metadata.context.messages
    .map(message => {
      const timestamp = message.timestamp.toLocaleTimeString();
      const role = message.role === 'user' ? 'ユーザー' : 'ボット';
      const sentiment = message.sentiment ? ` (${message.sentiment})` : '';
      
      return `### ${role} (${timestamp})${sentiment}\n${message.content}\n`;
    })
    .join('\n');
} 