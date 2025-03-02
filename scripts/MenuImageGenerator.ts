import { createCanvas, registerFont } from 'canvas';
type Canvas = ReturnType<typeof createCanvas>;
import { join } from 'path';

export class MenuImageGenerator {
  private readonly MAIN_MENU_WIDTH = 2500;
  private readonly MAIN_MENU_HEIGHT = 1686;
  private readonly CONVERSATION_MENU_WIDTH = 2500;
  private readonly CONVERSATION_MENU_HEIGHT = 843;

  constructor() {
    // フォントの登録（必要に応じて）
    // registerFont(join(__dirname, '../assets/fonts/your-font.ttf'), { family: 'YourFont' });
  }

  private createCanvas(width: number, height: number): Canvas {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // 背景を白に設定
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    return canvas;
  }

  private drawGrid(canvas: Canvas, rows: number, cols: number): void {
    const ctx = canvas.getContext('2d');
    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    // 縦線を描画
    for (let i = 1; i < cols; i++) {
      ctx.beginPath();
      ctx.moveTo(cellWidth * i, 0);
      ctx.lineTo(cellWidth * i, canvas.height);
      ctx.stroke();
    }

    // 横線を描画
    for (let i = 1; i < rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, cellHeight * i);
      ctx.lineTo(canvas.width, cellHeight * i);
      ctx.stroke();
    }
  }

  private drawText(canvas: Canvas, text: string, x: number, y: number): void {
    const ctx = canvas.getContext('2d');
    ctx.font = '48px sans-serif';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  async generateMainMenu(): Promise<Buffer> {
    const canvas = this.createCanvas(this.MAIN_MENU_WIDTH, this.MAIN_MENU_HEIGHT);
    this.drawGrid(canvas, 2, 2);

    // メインメニューのテキストを配置
    const cellWidth = this.MAIN_MENU_WIDTH / 2;
    const cellHeight = this.MAIN_MENU_HEIGHT / 2;

    const menuItems = [
      'アルコールレベルを設定',
      'トピックを選択',
      '会話を開始',
      'ヘルプ'
    ];

    menuItems.forEach((text, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = cellWidth * col + cellWidth / 2;
      const y = cellHeight * row + cellHeight / 2;
      this.drawText(canvas, text, x, y);
    });

    return canvas.toBuffer();
  }

  async generateConversationMenu(): Promise<Buffer> {
    const canvas = this.createCanvas(this.CONVERSATION_MENU_WIDTH, this.CONVERSATION_MENU_HEIGHT);
    this.drawGrid(canvas, 1, 3);

    // 会話メニューのテキストを配置
    const cellWidth = this.CONVERSATION_MENU_WIDTH / 3;
    const cellHeight = this.CONVERSATION_MENU_HEIGHT;

    const menuItems = [
      '会話を終了',
      'コンテキストを保存',
      'コンテキストを復元'
    ];

    menuItems.forEach((text, index) => {
      const x = cellWidth * index + cellWidth / 2;
      const y = cellHeight / 2;
      this.drawText(canvas, text, x, y);
    });

    return canvas.toBuffer();
  }
}
