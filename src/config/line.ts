import { ClientConfig, Client, MiddlewareConfig } from '@line/bot-sdk';

// 環境変数の検証
const validateEnv = () => {
  const requiredEnvVars = [
    'LINE_CHANNEL_SECRET',
    'LINE_CHANNEL_ACCESS_TOKEN',
    'DEFAULT_RICH_MENU_ID'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`${envVar} is not set`);
    }
  }
};

// 環境変数の検証を実行
validateEnv();

// LINE Bot設定
export const lineConfig: ClientConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!
};

// ミドルウェア設定
export const middlewareConfig: MiddlewareConfig = {
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!
};

// LINEクライアントのインスタンス
export const client = new Client(lineConfig);
