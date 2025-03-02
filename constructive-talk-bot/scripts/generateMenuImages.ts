import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { MenuImageGenerator } from '../src/utils/menuImageGenerator';

async function main() {
  try {
    console.log('リッチメニュー画像の生成を開始します...');

    // assetsディレクトリの作成
    const assetsDir = join(__dirname, '../assets');
    await mkdir(assetsDir, { recursive: true });

    // メインメニューの画像を生成
    console.log('メインメニューの画像を生成中...');
    const mainMenuBuffer = await new MenuImageGenerator().generateMainMenu();
    await writeFile(join(assetsDir, 'rich-menu-main.png'), mainMenuBuffer);
    console.log('メインメニューの画像を生成しました');

    // 会話メニューの画像を生成
    console.log('会話メニューの画像を生成中...');
    const conversationMenuBuffer = await new MenuImageGenerator().generateConversationMenu();
    await writeFile(join(assetsDir, 'rich-menu-conversation.png'), conversationMenuBuffer);
    console.log('会話メニューの画像を生成しました');

    console.log('リッチメニュー画像の生成が完了しました');
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

main(); 