
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// --- 設定 ---
// チェックしたい禁止単語のリスト
const forbiddenWords = ['呼吸数', '心拍数'];
// チェック対象のファイル拡張子
const targetExtensions = ['.ts', '.tsx', '.js', '.jsx'];
// チェック対象外のディレクトリ
const ignoreDirs = ['node_modules', 'dist'];
// --- 設定ここまで ---

const srcDir = path.join(__dirname, 'src');
let foundError = false;

console.log('🔍 禁止単語のチェックを開始します...');

// 正規表現のパターンを作成
const regex = new RegExp(forbiddenWords.join('|'), 'g');

// ファイルを検索してチェックを実行
const files = glob.sync(`${srcDir}/**/*`, { nodir: true });

for (const file of files) {
  if (!targetExtensions.includes(path.extname(file))) {
    continue;
  }

  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const match = line.match(regex);
    if (match) {
      foundError = true;
      console.error(
        `\x1b[31m[エラー]\x1b[0m ファイル: ${path.relative(__dirname, file)}:${index + 1}`
      );
      console.error(`  > 含まれている禁止単語: \x1b[33m${match.join(', ')}\x1b[0m`);
      console.error(`  > 内容: ${line.trim()}`);
      console.log(''); // 空行
    }
  });
}

if (foundError) {
  console.error('🚫 禁止単語が見つかりました。ビルドを中止します。');
  process.exit(1); // エラーでプロセスを終了
} else {
  console.log('✅ 禁止単語は見つかりませんでした。');
  process.exit(0); // 正常終了
}