import { mkdir } from 'fs/promises';
import { join } from 'path';
import { MenuImageGenerator } from './MenuImageGenerator';
import { writeFile } from 'fs/promises';

async function main() {
  try {
    console.log('リッチメニュー画像の生成を開始します...');

    // assetsディレクトリの作成
    const assetsDir = join(__dirname, '../assets');
    await mkdir(assetsDir, { recursive: true });

    const generator = new MenuImageGenerator();

    // メインメニューの画像を生成
    console.log('メインメニューの画像を生成中...');
    const mainMenuBuffer = await generator.generateMainMenu();
    await writeFile(join(assetsDir, 'main_menu.png'), mainMenuBuffer);
    console.log('メインメニューの画像を生成しました');

    // 会話メニューの画像を生成
    console.log('会話メニューの画像を生成中...');
    const conversationMenuBuffer = await generator.generateConversationMenu();
    await writeFile(join(assetsDir, 'conversation_menu.png'), conversationMenuBuffer);
    console.log('会話メニューの画像を生成しました');

    console.log('リッチメニュー画像の生成が完了しました');
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

main(); 