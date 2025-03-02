import { createCanvas, loadImage, registerFont } from 'canvas';
import { writeFileSync } from 'fs';
import { join } from 'path';

export class MenuImageGenerator {
  private static readonly MENU_WIDTH = 2500;
  private static readonly MENU_HEIGHT = 1686;
  private static readonly BACKGROUND_COLOR = '#2C2C2C';
  private static readonly TEXT_COLOR = '#FFFFFF';

  public static async generateMainMenu(): Promise<void> {
    const canvas = createCanvas(this.MENU_WIDTH, this.MENU_HEIGHT);
    const ctx = canvas.getContext('2d');

    // 背景
    ctx.fillStyle = this.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, this.MENU_WIDTH, this.MENU_HEIGHT);

    // グリッド線
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.MENU_WIDTH / 2, 0);
    ctx.lineTo(this.MENU_WIDTH / 2, this.MENU_HEIGHT);
    ctx.moveTo(0, this.MENU_HEIGHT / 2);
    ctx.lineTo(this.MENU_WIDTH, this.MENU_HEIGHT / 2);
    ctx.stroke();

    // テキストとアイコン
    const items = [
      { text: '会話を始める', icon: '💭', x: 625, y: 421 },
      { text: 'お酒レベル設定', icon: '🍺', x: 1875, y: 421 },
      { text: '話題を変える', icon: '🔄', x: 625, y: 1264 },
      { text: 'ヘルプ', icon: '❓', x: 1875, y: 1264 }
    ];

    ctx.fillStyle = this.TEXT_COLOR;
    ctx.font = 'bold 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const item of items) {
      ctx.font = '120px sans-serif';
      ctx.fillText(item.icon, item.x, item.y - 60);
      ctx.font = 'bold 72px sans-serif';
      ctx.fillText(item.text, item.x, item.y + 60);
    }

    // 保存
    const buffer = canvas.toBuffer('image/png');
    writeFileSync(join(__dirname, '../../assets/rich-menu-main.png'), buffer);
  }

  public static async generateConversationMenu(): Promise<void> {
    const canvas = createCanvas(this.MENU_WIDTH, this.MENU_HEIGHT);
    const ctx = canvas.getContext('2d');

    // 背景
    ctx.fillStyle = this.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, this.MENU_WIDTH, this.MENU_HEIGHT);

    // グリッド線
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.MENU_WIDTH / 3, 0);
    ctx.lineTo(this.MENU_WIDTH / 3, this.MENU_HEIGHT);
    ctx.moveTo(this.MENU_WIDTH * 2 / 3, 0);
    ctx.lineTo(this.MENU_WIDTH * 2 / 3, this.MENU_HEIGHT);
    ctx.stroke();

    // テキストとアイコン
    const items = [
      { text: '話を深める', icon: '🔍', x: 417, y: 843 },
      { text: '話題を変える', icon: '🔄', x: 1250, y: 843 },
      { text: '会話を終える', icon: '✋', x: 2083, y: 843 }
    ];

    ctx.fillStyle = this.TEXT_COLOR;
    ctx.font = 'bold 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const item of items) {
      ctx.font = '120px sans-serif';
      ctx.fillText(item.icon, item.x, item.y - 60);
      ctx.font = 'bold 72px sans-serif';
      ctx.fillText(item.text, item.x, item.y + 60);
    }

    // 保存
    const buffer = canvas.toBuffer('image/png');
    writeFileSync(join(__dirname, '../../assets/rich-menu-conversation.png'), buffer);
  }
} 