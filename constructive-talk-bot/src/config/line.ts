import { ClientConfig } from '@line/bot-sdk';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
  throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not set');
}

if (!process.env.LINE_CHANNEL_SECRET) {
  throw new Error('LINE_CHANNEL_SECRET is not set');
}

export const lineConfig: ClientConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

console.log('Loaded LINE config:', {
  hasAccessToken: !!lineConfig.channelAccessToken,
  hasSecret: !!lineConfig.channelSecret,
  accessTokenLength: lineConfig.channelAccessToken?.length,
  secretLength: lineConfig.channelSecret?.length
});

export const port = process.env.PORT || 3001; 