import { Client, RichMenu } from '@line/bot-sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

export class RichMenuManager {
  private mainMenuId: string | null = null;
  private readonly assetsPath: string;

  constructor(private client: Client) {
    // プロジェクトルートからの相対パスで assets ディレクトリを指定
    this.assetsPath = process.env.NODE_ENV === 'production'
      ? join(process.cwd(), 'assets')
      : join(__dirname, '../../assets');
  }

  /**
   * リッチメニューの画像を読み込む
   * @param imageName 画像ファイル名
   * @returns 画像バッファ
   */
  private loadMenuImage(imageName: string): Buffer {
    try {
      const imagePath = join(this.assetsPath, imageName);
      console.log(`画像を読み込みます: ${imagePath}`);
      return readFileSync(imagePath);
    } catch (error) {
      console.error(`画像の読み込みに失敗しました: ${imageName}`, error);
      throw new Error(`メニュー画像の読み込みに失敗しました: ${imageName}`);
    }
  }

  public async setupDefaultRichMenus(): Promise<void> {
    try {
      console.log('リッチメニューのセットアップを開始します...');
      
      // メインメニューの作成
      this.mainMenuId = await this.createMainMenu();
      console.log('メインメニューを作成しました:', this.mainMenuId);

      // メインメニューをデフォルトとして設定
      await this.client.setDefaultRichMenu(this.mainMenuId);
      console.log('デフォルトメニューを設定しました');

      console.log('リッチメニューのセットアップが完了しました');
    } catch (error) {
      console.error('リッチメニューのセットアップに失敗しました:', error);
      throw error;
    }
  }

  private async createMainMenu(): Promise<string> {
    const richMenu: RichMenu = {
      size: {
        width: 2500,
        height: 1686
      },
      selected: false,
      name: 'Main Menu',
      chatBarText: 'メニューを開く',
      areas: [
        {
          bounds: {
            x: 0,
            y: 0,
            width: 1250,
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
            x: 1251,
            y: 0,
            width: 1250,
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
            x: 0,
            y: 844,
            width: 1250,
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
            x: 1251,
            y: 844,
            width: 1250,
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
      const richMenuId = await this.client.createRichMenu(richMenu);
      console.log('リッチメニューを作成しました:', richMenuId);

      const imageBuffer = this.loadMenuImage('rich-menu-main.png');
      await this.client.setRichMenuImage(richMenuId, imageBuffer);
      console.log('リッチメニュー画像を設定しました');

      // メインメニューIDを保存
      this.mainMenuId = richMenuId;
      return richMenuId;
    } catch (error) {
      console.error('メインメニューの作成に失敗しました:', error);
      throw new Error('メインメニューの作成に失敗しました: ' + (error as Error).message);
    }
  }

  private async createConversationMenu(): Promise<string> {
    const richMenu: RichMenu = {
      size: {
        width: 2500,
        height: 1686
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
            height: 1686
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
            height: 1686
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
            height: 1686
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
      const richMenuId = await this.client.createRichMenu(richMenu);
      console.log('会話メニューを作成しました:', richMenuId);

      const imageBuffer = this.loadMenuImage('rich-menu-conversation.png');
      await this.client.setRichMenuImage(richMenuId, imageBuffer);
      console.log('会話メニュー画像を設定しました');

      return richMenuId;
    } catch (error) {
      console.error('会話メニューの作成に失敗しました:', error);
      throw new Error('会話メニューの作成に失敗しました: ' + (error as Error).message);
    }
  }

  public async switchToConversationMenu(userId: string): Promise<void> {
    try {
      const menuId = await this.createConversationMenu();
      await this.client.linkRichMenuToUser(userId, menuId);
      console.log(`ユーザー ${userId} の会話メニューを切り替えました`);
    } catch (error) {
      console.error('会話メニューへの切り替えに失敗しました:', error);
      throw error;
    }
  }

  public async switchToMainMenu(userId: string): Promise<void> {
    try {
      if (!this.mainMenuId) {
        console.log('メインメニューIDが設定されていません。新しく作成します。');
        this.mainMenuId = await this.createMainMenu();
      }
      await this.client.linkRichMenuToUser(userId, this.mainMenuId);
      console.log(`ユーザー ${userId} のメインメニューを切り替えました`);
    } catch (error) {
      console.error('メインメニューへの切り替えに失敗しました:', error);
      throw new Error('メインメニューへの切り替えに失敗しました: ' + (error as Error).message);
    }
  }
}
