// node plot-sheet/build-docx.js → dist/ に空欄テンプレート・記入例・使い方ガイドの DOCX を出力する
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, AlignmentType, PageBreak, Footer, PageNumber, HeightRule, VerticalAlign,
  LevelFormat, TableLayoutType,
} = require('docx');
const C = require('./content');
const GUIDE = require('./guide');

const OUT = path.join(__dirname, '..', 'dist');
fs.mkdirSync(OUT, { recursive: true });

const FONT = { ascii: 'Yu Gothic', eastAsia: 'Yu Gothic', hAnsi: 'Yu Gothic' };
const MARGIN = 850;                 // 約15mm
const PAGE_W = 11906;               // A4
const CONTENT_W = PAGE_W - MARGIN * 2; // 10206
const LABEL_W = 3400;
const GREY = '666666';
const LINE = 'A6A6A6';
const HEAD_FILL = 'EDEFF3';

const run = (text, o = {}) => new TextRun({ text, font: FONT, size: o.size || 20, bold: o.bold, color: o.color });
const para = (children, o = {}) => new Paragraph({
  children: Array.isArray(children) ? children : [children],
  spacing: { before: o.before ?? 0, after: o.after ?? 80, line: o.line ?? 300 },
  alignment: o.align, keepNext: o.keepNext, numbering: o.numbering,
});
const text = (t, o = {}) => para(run(t, o), o);
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const borders = { top: border, bottom: border, left: border, right: border };

function cell(children, width, o = {}) {
  return new TableCell({
    children, width: { size: width, type: WidthType.DXA }, borders,
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    verticalAlign: o.valign || VerticalAlign.TOP, columnSpan: o.span,
  });
}

// ラベル欄：◎/○ ＋ 項目名 ＋ 小さな説明
function labelCell(f, width, showHint = true) {
  const kids = [para([run(f.req ? '◎ ' : '○ ', { bold: true, color: f.req ? '1F3A5F' : GREY }), run(f.label, { bold: true })], { after: 30, line: 280 })];
  if (f.hint && showHint) kids.push(para(run(f.hint, { size: 15, color: GREY }), { after: 0, line: 240 }));
  return cell(kids, width, { fill: HEAD_FILL });
}

// 記入欄：値があればそれを、なければ空段落（高さは行の最低高さで確保）
function valueCell(value, width) {
  const v = value == null ? '' : value;
  return cell([para(run(v, { size: 19 }), { after: 0, line: 290 })], width);
}

function fieldRow(f, value, minH, labelW = LABEL_W, showHint = true) {
  const valueW = CONTENT_W - labelW;
  if (f.pair) {
    const vals = Array.isArray(value) ? value : ['', ''];
    const sub = (name, v) => para([run(`${name}：`, { bold: true, size: 18, color: GREY }), run(v || '', { size: 19 })], { after: 40, line: 290 });
    return new TableRow({
      cantSplit: true,
      height: { value: minH, rule: HeightRule.ATLEAST },
      children: [labelCell(f, labelW, showHint), cell([sub(f.pair[0], vals[0]), sub(f.pair[1], vals[1])], valueW)],
    });
  }
  return new TableRow({
    cantSplit: true,
    height: { value: minH, rule: HeightRule.ATLEAST },
    children: [labelCell(f, labelW, showHint), valueCell(value, valueW)],
  });
}

const table = (rows, widths) => new Table({
  rows, width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED,
});

function sheetTitle(t, sub) {
  const out = [new Paragraph({
    children: [run(t, { size: 30, bold: true })], spacing: { after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: '1F3A5F', space: 4 } },
  })];
  if (sub) out.push(text(sub, { size: 17, color: GREY, after: 160 }));
  return out;
}

// ───── 各シート ─────
function coverPage(kind) {
  const label = kind === 'sample' ? '記入例' : '空欄テンプレート';
  const out = [
    text(`${C.TITLE}（${label}）`, { size: 40, bold: true, after: 60 }),
    text(C.SUBTITLE, { size: 21, color: GREY, after: 60 }),
    text(`作成：${C.AUTHOR}　バージョン ${C.VERSION}`, { size: 17, color: GREY, after: 280 }),
  ];
  if (kind === 'sample') out.push(text(C.SAMPLE.note, { size: 19, bold: true, after: 200 }));
  out.push(...sheetTitle('記入ガイド'));
  C.QUICK_GUIDE.steps.forEach(([h, b], i) => {
    out.push(para([run(`${i + 1}. ${h}`, { bold: true, size: 22 })], { after: 40, keepNext: true }));
    out.push(text(b, { size: 19, after: 160 }));
  });
  out.push(text('このシートの約束ごと', { bold: true, size: 22, before: 120, after: 60 }));
  C.QUICK_GUIDE.notes.forEach((n) => out.push(para(run(n, { size: 19 }), { numbering: { reference: 'bullet', level: 0 }, after: 60 })));
  out.push(text('入っているシート：全体設計シート（1ページ）／場面設計シート／プロット診断チェックリスト（1ページ）', { size: 18, color: GREY, before: 200 }));
  out.push(text('くわしい使い方は「使い方ガイド」をご覧ください。', { size: 18, color: GREY }));
  return out;
}

function overallPage(values) {
  const v = values || {};
  const rows = C.OVERALL.map((f) => fieldRow(f, v[f.key], f.pair ? 820 : (f.lines === 2 ? 820 : 560)));
  return [
    ...sheetTitle('全体設計シート', '◎だけで使い始められます。○は必要になったら書きます。決まっていない欄は「未定」と書きます。'),
    table(rows, [LABEL_W, CONTENT_W - LABEL_W]),
  ];
}

const SCENE_LABEL_W = 2950;
function sceneTable(no, s, showHint) {
  const v = s || {};
  const valueW = CONTENT_W - SCENE_LABEL_W;
  const head = new TableRow({
    cantSplit: true, tableHeader: false,
    children: [cell([para([run(`場面 ${no != null ? no : '　　'}`, { bold: true, size: 22 }), run('　見出し：', { size: 18, color: GREY }), run(v.heading || '', { bold: true, size: 20 })], { after: 0 })], CONTENT_W, { fill: 'DCE3EC', span: 2 })],
  });
  // 説明つきの最初の場面は1ページに1場面なので、記入欄を広く取る
  const rows = C.SCENE.map((f) => fieldRow(f, v[f.key], showHint ? (f.req ? 1250 : 650) : (s ? (f.req ? 760 : 500) : (f.req ? 860 : 500)), SCENE_LABEL_W, showHint));
  return table([head, ...rows], [SCENE_LABEL_W, valueW]);
}

// 1ページ目は説明つきの場面1だけ、2ページ目以降は1ページに2場面
function scenePages(scenes) {
  const out = [];
  scenes.forEach((s, i) => {
    const pageStart = i === 0 || i % 2 === 1;
    if (pageStart) {
      if (i > 0) out.push(pageBreak());
      out.push(...sheetTitle('場面設計シート', i === 0 ? '一つの表が一つの場面です。「だから、次の場面が必要になる」が、次の場面の「主人公がしようとすること」につながっているかを見ます。足りなければ表をコピーして増やします。' : null));
    } else {
      out.push(text('', { after: 160 }));
    }
    out.push(sceneTable(s ? i + 1 : null, s, i === 0));
  });
  return out;
}

function checklistPage() {
  const W = [520, 2700, 3700, CONTENT_W - 520 - 2700 - 3700];
  const hdr = new TableRow({
    tableHeader: true, cantSplit: true,
    children: ['確認', 'チェック項目', '確かめ方', '引っかかったら'].map((t, i) => cell([text(t, { bold: true, size: 18, after: 0 })], W[i], { fill: HEAD_FILL })),
  });
  const rows = C.CHECKS.map((c, i) => new TableRow({
    cantSplit: true,
    children: [
      cell([text('□', { size: 24, after: 0, align: AlignmentType.CENTER })], W[0], { valign: VerticalAlign.CENTER }),
      cell([text(`${i + 1}. ${c.q}`, { bold: true, size: 19, after: 0, line: 280 })], W[1]),
      cell([text(c.how, { size: 17, after: 0, line: 260 })], W[2]),
      cell([text(c.fix, { size: 17, after: 0, line: 260 })], W[3]),
    ],
  }));
  return [
    ...sheetTitle('プロット診断チェックリスト', '場面設計シートと見比べながら確かめます。「直す箇所」ではなく「確かめる箇所」を見つけるためのものです。'),
    table([hdr, ...rows], W),
    text('作品によって判断が変わること', { bold: true, size: 20, before: 220, after: 60 }),
    ...C.CHECK_NOTE.slice(1).map((n) => para(run(n, { size: 17 }), { numbering: { reference: 'bullet', level: 0 }, after: 50, line: 270 })),
  ];
}

// ───── 共通 ─────
function doc(children) {
  return new Document({
    creator: C.AUTHOR, title: C.TITLE, description: C.SUBTITLE,
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    numbering: { config: [{ reference: 'bullet', levels: [{ level: 0, format: LevelFormat.BULLET, text: '・', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }] }] },
    sections: [{
      properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN, footer: 400 } } },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [run(`${C.COPYRIGHT}　`, { size: 14, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 14, color: GREY })],
          })],
        }),
      },
      children,
    }],
  });
}

function templateDoc(kind) {
  const sample = kind === 'sample';
  return doc([
    ...coverPage(kind),
    pageBreak(),
    ...overallPage(sample ? C.SAMPLE.overall : null),
    pageBreak(),
    ...scenePages(sample ? C.SAMPLE.scenes : Array(C.BLANK_SCENES).fill(null)),
    pageBreak(),
    ...checklistPage(),
  ]);
}

function guideDoc() {
  const out = [
    text(`${C.TITLE} 使い方ガイド`, { size: 36, bold: true, after: 60 }),
    text(`作成：${C.AUTHOR}　バージョン ${C.VERSION}`, { size: 17, color: GREY, after: 240 }),
  ];
  const bullet = (t) => para(run(t, { size: 20 }), { numbering: { reference: 'bullet', level: 0 }, after: 80, line: 320 });
  GUIDE.forEach((s) => {
    out.push(...sheetTitle(s.h));
    (s.p || []).forEach((p) => out.push(text(p, { after: 140, line: 330 })));
    (s.li || []).forEach((l) => out.push(bullet(l)));
    (s.p2 || []).forEach((p) => out.push(text(p, { after: 140, line: 330, before: 60 })));
    out.push(text('', { after: 120 }));
  });
  out.push(...sheetTitle('利用条件'));
  require('./terms').forEach((t) => out.push(bullet(t)));
  return doc(out);
}

(async () => {
  const files = [
    ['plot-sheet-blank.docx', templateDoc('blank')],
    ['plot-sheet-sample.docx', templateDoc('sample')],
    ['plot-sheet-guide.docx', guideDoc()],
  ];
  for (const [name, d] of files) {
    fs.writeFileSync(path.join(OUT, name), await Packer.toBuffer(d));
    console.log('wrote', name);
  }
})();
