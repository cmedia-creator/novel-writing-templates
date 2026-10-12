// README.md・LICENSE.md を content.js / terms.js から生成する
const fs = require('fs');
const path = require('path');
const C = require('../plot-sheet/content');
const T = require('../plot-sheet/terms');

const root = path.join(__dirname, '..');
const REL = `https://github.com/cmedia-creator/novel-writing-templates/releases/download/plot-sheet-v${C.VERSION}/`;
const ARTICLE = process.env.ARTICLE_URL || 'https://note.com/saakun777/n/nc70be469eaaa';
const terms = T.map((t) => `- ${t}`).join('\n');
const fence = '```';

const readme = `# 創作テンプレート集（novel-writing-templates）

小説・シナリオを書く人のための、無料で使えるテンプレートを置いているリポジトリです。作成は [久賀ラトル](https://note.com/saakun777)（元ゲームシナリオライター）です。

## 小説プロット設計シート（v${C.VERSION}）

${C.SUBTITLE}です。

全体設計シート・場面設計シート・プロット診断チェックリストの3枚で、場面ごとに「主人公がしようとすること → 障害 → 選択・行動 → 結果 → だから次の場面が必要になる」を書き、物語が成立する理由を確かめます。◎（必須）だけで使い始められます。

### ダウンロード（会員登録・メールアドレスは不要です）

| ファイル | 内容 |
|---|---|
| [**まとめてダウンロード（ZIP）**](${REL}novel-plot-sheet-v${C.VERSION}.zip) | 下の4ファイルと説明書きのセット |
| [空欄テンプレート（Word）](${REL}plot-sheet-blank.docx) | 記入ガイド／全体設計シート／場面設計シート（${C.BLANK_SCENES}場面）／プロット診断チェックリスト |
| [記入例（Word）](${REL}plot-sheet-sample.docx) | 架空の作品『${C.SAMPLE.overall.title}』で、最初から結末まで記入したもの |
| [場面一覧表（Excel）](${REL}scene-list.xlsx) | 場面設計シートと同じ項目を一行一場面で書ける表（空欄・記入例） |
| [使い方ガイド（Word）](${REL}plot-sheet-guide.docx) | どこから書くか／決まっていない項目の扱い／場面がつながらないとき／本文に進む目安／向かないケース |

Microsoft Word・Excel のほか、Google ドキュメント・スプレッドシート、LibreOffice などでも開けます。アプリによって表の幅や改ページ位置が少し変わることがあります。マクロは使っていません。

商業ゲームのシナリオ制作でプロットを作ってきた経験をもとに、いま小説を書く人が使いやすい形に作り直したものです。制作現場で使われていた書式そのものではありません。

${ARTICLE ? `解説記事（note）：[${ARTICLE}](${ARTICLE})` : '解説記事（note）：準備中'}

## 利用条件

${terms}

## 作り方（開発者向け）

${fence}
npm install
npm run build    # dist/ に DOCX・XLSX・ZIP を出力
npm run verify   # 配布物の検証
${fence}

項目の定義と記入例は plot-sheet/content.js、使い方ガイドは plot-sheet/guide.js、利用条件は plot-sheet/terms.js にあります。

© 2026 久賀ラトル
`;

const license = `# 利用条件

対象：このリポジトリのテンプレート（plot-sheet/ の内容から生成される DOCX・XLSX・ZIP などの配布物）

${terms}

ビルド用のスクリプト（*.js）は、配布物を作るためだけに置いています。

© 2026 久賀ラトル
`;

fs.writeFileSync(path.join(root, 'README.md'), readme);
fs.writeFileSync(path.join(root, 'LICENSE.md'), license);
console.log('wrote README.md, LICENSE.md');
