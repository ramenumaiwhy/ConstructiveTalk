import { Client, RichMenu } from '@line/bot-sdk';

export class RichMenuManager {
  private mainMenuId: string | null = null;

  constructor(private client: Client) {}

  public async setupDefaultRichMenus(): Promise<void> {
    try {
      console.log('[RichMenu] リッチメニューのセットアップを開始します...');
      
      // メインメニューの作成
      this.mainMenuId = await this.createMainMenu();
      console.log('[RichMenu] メインメニューを作成しました:', this.mainMenuId);

      // メインメニューをデフォルトとして設定
      await this.client.setDefaultRichMenu(this.mainMenuId);
      console.log('[RichMenu] デフォルトメニューを設定しました');

      console.log('[RichMenu] リッチメニューのセットアップが完了しました');
    } catch (error) {
      console.error('[RichMenu] リッチメニューのセットアップに失敗しました:', error);
      throw error;
    }
  }

  private async createMainMenu(): Promise<string> {
    const richMenu: RichMenu = {
      size: {
        width: 2500,
        height: 843
      },
      selected: false,
      name: 'Main Menu',
      chatBarText: 'メニューを開く',
      areas: [
        {
          bounds: {
            x: 0,
            y: 0,
            width: 833,
            height: 843
          },
          action: {
            type: 'postback',
            label: '会話を始める',
            data: 'start_conversation'
          }
        },
        {
          bounds: {
            x: 834,
            y: 0,
            width: 833,
            height: 843
          },
          action: {
            type: 'postback',
            label: 'お酒レベル設定',
            data: 'set_alcohol_level'
          }
        },
        {
          bounds: {
            x: 1667,
            y: 0,
            width: 833,
            height: 843
          },
          action: {
            type: 'postback',
            label: 'ヘルプ',
            data: 'help'
          }
        }
      ]
    };

    try {
      console.log('[RichMenu] リッチメニューを作成中...');
      const richMenuId = await this.client.createRichMenu(richMenu);
      console.log('[RichMenu] リッチメニューID:', richMenuId);

      // 2500x843の白色の画像を生成
      const imageBuffer = this.createWhiteImage(2500, 843);

      console.log('[RichMenu] リッチメニュー画像をアップロード中...');
      await this.client.setRichMenuImage(richMenuId, imageBuffer);
      console.log('[RichMenu] リッチメニュー画像のアップロードが完了しました');

      return richMenuId;
    } catch (error) {
      console.error('[RichMenu] リッチメニューの作成に失敗しました:', error);
      throw error;
    }
  }

  private async createConversationMenu(): Promise<string> {
    const richMenu: RichMenu = {
      size: {
        width: 2500,
        height: 843
      },
      selected: false,
      name: 'Conversation Menu',
      chatBarText: '会話メニュー',
      areas: [
        {
          bounds: {
            x: 0,
            y: 0,
            width: 833,
            height: 843
          },
          action: {
            type: 'postback',
            label: '話を深める',
            data: 'deep_dive'
          }
        },
        {
          bounds: {
            x: 834,
            y: 0,
            width: 833,
            height: 843
          },
          action: {
            type: 'postback',
            label: '話題を変える',
            data: 'change_topic'
          }
        },
        {
          bounds: {
            x: 1667,
            y: 0,
            width: 833,
            height: 843
          },
          action: {
            type: 'postback',
            label: '会話を終える',
            data: 'end_conversation'
          }
        }
      ]
    };

    try {
      console.log('[RichMenu] 会話メニューを作成中...');
      const richMenuId = await this.client.createRichMenu(richMenu);
      console.log('[RichMenu] 会話メニューID:', richMenuId);

      // 2500x843の白色の画像を生成
      const imageBuffer = this.createWhiteImage(2500, 843);

      console.log('[RichMenu] 会話メニュー画像をアップロード中...');
      await this.client.setRichMenuImage(richMenuId, imageBuffer);
      console.log('[RichMenu] 会話メニュー画像のアップロードが完了しました');

      return richMenuId;
    } catch (error) {
      console.error('[RichMenu] 会話メニューの作成に失敗しました:', error);
      throw error;
    }
  }

  private createWhiteImage(width: number, height: number): Buffer {
    // PNGヘッダー
    const header = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    ]);

    // IHDRチャンク
    const ihdr = Buffer.alloc(25);
    ihdr.writeUInt32BE(13, 0); // Length
    ihdr.write('IHDR', 4);
    ihdr.writeUInt32BE(width, 8);
    ihdr.writeUInt32BE(height, 12);
    ihdr.writeUInt8(8, 16); // Bit depth
    ihdr.writeUInt8(6, 17); // Color type (RGBA)
    ihdr.writeUInt8(0, 18); // Compression
    ihdr.writeUInt8(0, 19); // Filter
    ihdr.writeUInt8(0, 20); // Interlace
    const ihdrCrc = this.calculateCrc32(ihdr.slice(4, 21));
    ihdr.writeUInt32BE(ihdrCrc, 21);

    // IDATチャンク（白色のピクセルデータ）
    const dataSize = width * height * 4;
    const idat = Buffer.alloc(dataSize + 12);
    idat.writeUInt32BE(dataSize, 0);
    idat.write('IDAT', 4);
    for (let i = 0; i < dataSize; i += 4) {
      idat[i + 8] = 255; // R
      idat[i + 9] = 255; // G
      idat[i + 10] = 255; // B
      idat[i + 11] = 255; // A
    }
    const idatCrc = this.calculateCrc32(idat.slice(4, dataSize + 8));
    idat.writeUInt32BE(idatCrc, dataSize + 8);

    // IENDチャンク
    const iend = Buffer.from([
      0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4E, 0x44,
      0xAE, 0x42, 0x60, 0x82
    ]);

    return Buffer.concat([header, ihdr, idat, iend]);
  }

  private calculateCrc32(data: Buffer): number {
    let crc = 0xffffffff;
    for (const byte of data) {
      crc ^= byte;
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      }
    }
    return ~crc >>> 0;
  }

  public async switchToConversationMenu(userId: string): Promise<void> {
    try {
      console.log(`[RichMenu] ユーザー ${userId} の会話メニューを作成中...`);
      const menuId = await this.createConversationMenu();
      console.log(`[RichMenu] ユーザー ${userId} の会話メニューを設定中...`);
      await this.client.linkRichMenuToUser(userId, menuId);
      console.log(`[RichMenu] ユーザー ${userId} の会話メニューを切り替えました`);
    } catch (error) {
      console.error('[RichMenu] 会話メニューへの切り替えに失敗しました:', error);
      throw error;
    }
  }

  public async switchToMainMenu(userId: string): Promise<void> {
    try {
      console.log(`[RichMenu] ユーザー ${userId} のメインメニューに切り替え中...`);
      await this.client.unlinkRichMenuFromUser(userId);
      console.log(`[RichMenu] ユーザー ${userId} のメインメニューを切り替えました`);
    } catch (error) {
      console.error('[RichMenu] メインメニューへの切り替えに失敗しました:', error);
      throw error;
    }
  }
} 