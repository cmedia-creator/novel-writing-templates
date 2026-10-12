// node plot-sheet/build-xlsx.js → dist/scene-list.xlsx（場面設計シートと同じ項目を一行一場面で書く表）
const path = require('path');
const ExcelJS = require('exceljs');
const C = require('./content');

const OUT = path.join(__dirname, '..', 'dist', 'scene-list.xlsx');
const FONT = { name: 'Yu Gothic', size: 10 };
const HEAD_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE3EC' } };
const OPT_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4F5F7' } };
const thin = { style: 'thin', color: { argb: 'FFA6A6A6' } };
const BORDER = { top: thin, bottom: thin, left: thin, right: thin };

// 列の順番は場面設計シートと同じ（場面番号・見出し ＋ SCENE の各項目）
const COLS = [
  { key: 'no', header: '場面', width: 6 },
  { key: 'heading', header: '見出し', width: 18 },
  ...C.SCENE.map((f) => ({ key: f.key, header: `${f.req ? '◎' : '○'} ${f.label}`, width: f.req ? 30 : 20, req: f.req, hint: f.hint })),
];

function sceneSheet(wb, name, scenes, rowsWanted) {
  const ws = wb.addWorksheet(name, {
    views: [{ state: 'frozen', xSplit: 2, ySplit: 2 }],
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } },
    headerFooter: { oddFooter: `&8${C.COPYRIGHT}　&P / &N` },
  });
  ws.columns = COLS.map((c) => ({ key: c.key, width: c.width }));
  const head = ws.getRow(1);
  COLS.forEach((c, i) => { head.getCell(i + 1).value = c.header; });
  const hint = ws.getRow(2);
  COLS.forEach((c, i) => { hint.getCell(i + 1).value = c.hint || (c.key === 'no' ? '番号' : '短い名前'); });
  [head, hint].forEach((r, ri) => r.eachCell((cell) => {
    cell.font = { ...FONT, bold: ri === 0, size: ri === 0 ? 10 : 8, color: ri === 0 ? undefined : { argb: 'FF666666' } };
    cell.fill = HEAD_FILL; cell.border = BORDER;
    cell.alignment = { wrapText: true, vertical: 'top' };
  }));
  head.height = 30; hint.height = 42;
  ws.pageSetup.printTitlesRow = '1:2';

  for (let i = 0; i < rowsWanted; i++) {
    const s = scenes[i];
    const row = ws.getRow(i + 3);
    COLS.forEach((c, ci) => {
      const cell = row.getCell(ci + 1);
      cell.value = c.key === 'no' ? i + 1 : (s ? (s[c.key] || '') : '');
      cell.font = FONT; cell.border = BORDER;
      cell.alignment = { wrapText: true, vertical: 'top', horizontal: c.key === 'no' ? 'center' : 'left' };
      if (c.req === false) cell.fill = OPT_FILL;
    });
    row.height = s ? 96 : 48;
  }
  return ws;
}

function guideSheet(wb) {
  const ws = wb.addWorksheet('使い方');
  ws.getColumn(1).width = 110;
  const lines = [
    [`${C.TITLE}　場面一覧表（Excel版）`, { bold: true, size: 14 }],
    [`作成：${C.AUTHOR}　バージョン ${C.VERSION}`, { size: 9, color: { argb: 'FF666666' } }],
    ['', {}],
    ['Word版の「場面設計シート」と同じ項目を、一行一場面で書くための表です。場面の追加や並べ替えをしやすくしたものです。', {}],
    ['・「場面一覧（空欄）」シートに記入します。行が足りなければ、行をコピーして挿入してください。', {}],
    ['・場面を並べ替えたら、A列の番号を振り直してください。', {}],
    ['・◎は必須、○は任意です（○の列は薄い灰色）。決まっていない欄は「未定」と書きます。', {}],
    ['・一行ごとに、「だから、次の場面が必要になる」が次の行の「主人公がしようとすること」につながっているかを見ます。', {}],
    ['・全体設計シートとプロット診断チェックリストは、Word版に入っています。', {}],
    ['・「記入例」シートは、架空の作品『代筆屋の一週間』で記入したものです。', {}],
    ['', {}],
    [C.COPYRIGHT, { size: 9, color: { argb: 'FF666666' } }],
  ];
  lines.forEach(([t, f], i) => {
    const cell = ws.getCell(i + 1, 1);
    cell.value = t; cell.font = { ...FONT, ...f }; cell.alignment = { wrapText: true, vertical: 'top' };
  });
  return ws;
}

(async () => {
  const wb = new ExcelJS.Workbook();
  wb.creator = C.AUTHOR; wb.title = `${C.TITLE} 場面一覧表`;
  guideSheet(wb);
  sceneSheet(wb, '場面一覧（空欄）', [], 30);
  sceneSheet(wb, '記入例', C.SAMPLE.scenes, C.SAMPLE.scenes.length);
  await wb.xlsx.writeFile(OUT);
  console.log('wrote', path.basename(OUT));
})();
