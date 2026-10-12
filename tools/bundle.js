// dist/ の配布物と説明書きを ZIP にまとめる → dist/novel-plot-sheet-v<VERSION>.zip
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const C = require('../plot-sheet/content');
const TERMS = require('../plot-sheet/terms');

const dist = path.join(__dirname, '..', 'dist');
const FILES = ['plot-sheet-blank.docx', 'plot-sheet-sample.docx', 'scene-list.xlsx', 'plot-sheet-guide.docx'];
const readme = [
  `${C.TITLE} v${C.VERSION}（作成：${C.AUTHOR}）`,
  '',
  '入っているファイル',
  '  plot-sheet-blank.docx  … 空欄テンプレート（記入ガイド／全体設計シート／場面設計シート／プロット診断チェックリスト）',
  `  plot-sheet-sample.docx … 記入例（架空の作品『${C.SAMPLE.overall.title}』）`,
  '  scene-list.xlsx        … 場面一覧表（Excel。一行一場面で書く表）',
  '  plot-sheet-guide.docx  … 使い方ガイド',
  '',
  'はじめに plot-sheet-blank.docx を開き、1ページ目の記入ガイドを読んでください。',
  '',
  '利用条件',
  ...TERMS.map((t) => `  ・${t}`),
  '',
  '配布ページ：https://github.com/cmedia-creator/novel-writing-templates',
  '',
].join('\r\n');

(async () => {
  const zip = new JSZip();
  const folder = zip.folder(`novel-plot-sheet-v${C.VERSION}`);
  FILES.forEach((f) => folder.file(f, fs.readFileSync(path.join(dist, f))));
  folder.file('README.txt', '﻿' + readme);
  const out = path.join(dist, `novel-plot-sheet-v${C.VERSION}.zip`);
  fs.writeFileSync(out, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  console.log('wrote', path.basename(out));
})();
