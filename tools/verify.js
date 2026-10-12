// node tools/verify.js [dir] → dist（または指定ディレクトリ）の配布物を検証する
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const ExcelJS = require('exceljs');
const C = require('../plot-sheet/content');
const TERMS = require('../plot-sheet/terms');

const dir = process.argv[2] || path.join(__dirname, '..', 'dist');
let ok = 0, ng = 0;
const check = (name, cond, detail = '') => { if (cond) ok++; else ng++; console.log(`${cond ? 'OK ' : 'NG '} ${name}${detail ? ' — ' + detail : ''}`); };

const docText = async (file) => {
  const zip = await JSZip.loadAsync(fs.readFileSync(path.join(dir, file)));
  const xml = await zip.file('word/document.xml').async('string');
  const paras = xml.split('</w:p>').map((p) => (p.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || []).map((t) => t.replace(/<[^>]+>/g, '')).join(''));
  return { text: paras.join('\n'), zip, xml };
};
const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");

(async () => {
  // 1. 記入例の項目が定義と一致しているか
  const oKeys = C.OVERALL.map((f) => f.key);
  check('記入例：全体設計の項目が定義と一致', JSON.stringify(Object.keys(C.SAMPLE.overall).sort()) === JSON.stringify([...oKeys].sort()));
  check('記入例：全体設計の◎がすべて埋まっている', C.OVERALL.filter((f) => f.req).every((f) => { const v = C.SAMPLE.overall[f.key]; return Array.isArray(v) ? v.every(Boolean) : !!v; }));
  const sKeys = ['heading', ...C.SCENE.map((f) => f.key)].sort();
  check('記入例：全場面の項目が定義と一致', C.SAMPLE.scenes.every((s) => JSON.stringify(Object.keys(s).sort()) === JSON.stringify(sKeys)));
  check('記入例：全場面の◎が埋まっている', C.SAMPLE.scenes.every((s) => C.SCENE.filter((f) => f.req).every((f) => s[f.key])));
  check('記入例：重要な選択が参照する場面番号が存在', /場面6/.test(C.SAMPLE.overall.choice) && C.SAMPLE.scenes.length >= 6);

  // 2. DOCX
  for (const [file, kind] of [['plot-sheet-blank.docx', 'blank'], ['plot-sheet-sample.docx', 'sample'], ['plot-sheet-guide.docx', 'guide']]) {
    const { text, zip, xml } = await docText(file);
    const t = unesc(text);
    check(`${file}：ZIP・document.xml を読める`, xml.length > 1000);
    check(`${file}：マクロなし`, !Object.keys(zip.files).some((n) => /vbaProject|\.bin$/i.test(n)));
    check(`${file}：外部リンク（外部リレーション）なし`, !Object.keys(zip.files).some((n) => /_rels/.test(n)) || !(await Promise.all(Object.keys(zip.files).filter((n) => n.endsWith('.rels')).map((n) => zip.file(n).async('string')))).some((r) => /TargetMode="External"/.test(r)));
    const footer = Object.keys(zip.files).filter((n) => /footer/.test(n) && n.endsWith('.xml'));
    const ftext = (await Promise.all(footer.map((n) => zip.file(n).async('string')))).join('');
    check(`${file}：フッターに著作権表示`, unesc(ftext).includes('© 2026 久賀ラトル'));
    if (kind !== 'guide') {
      check(`${file}：全体設計の項目名がすべてある`, C.OVERALL.every((f) => t.includes(f.label)));
      check(`${file}：場面設計の項目名がすべてある`, C.SCENE.every((f) => t.includes(f.label)));
      check(`${file}：診断チェック7項目がすべてある`, C.CHECKS.every((c) => t.includes(c.q)));
      const sceneCount = (t.match(/^場面 /gm) || []).length;
      const want = kind === 'sample' ? C.SAMPLE.scenes.length : C.BLANK_SCENES;
      check(`${file}：場面の表が ${want} 個`, sceneCount === want, `実際 ${sceneCount}`);
    }
    if (kind === 'sample') {
      const vals = [];
      Object.values(C.SAMPLE.overall).forEach((v) => (Array.isArray(v) ? vals.push(...v) : vals.push(v)));
      C.SAMPLE.scenes.forEach((s) => Object.values(s).forEach((v) => v && vals.push(v)));
      const missing = vals.filter((v) => !t.includes(v));
      check(`${file}：記入例の文がすべて本文に入っている（${vals.length}件）`, missing.length === 0, missing.slice(0, 2).join(' / '));
    }
    if (kind === 'blank') {
      check(`${file}：記入例の文が混入していない`, !t.includes('代筆') && !t.includes('ひより'));
    }
    if (kind === 'guide') {
      check(`${file}：利用条件がすべてある`, TERMS.every((x) => t.includes(x)));
      check(`${file}：制作現場の書式そのものではないと明記`, t.includes('制作現場で使われていた書式そのものではありません'));
    }
  }

  // 3. XLSX
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path.join(dir, 'scene-list.xlsx'));
  check('scene-list.xlsx：シート3枚（使い方・空欄・記入例）', ['使い方', '場面一覧（空欄）', '記入例'].every((n) => wb.getWorksheet(n)));
  const headers = wb.getWorksheet('場面一覧（空欄）').getRow(1).values.slice(1);
  check('scene-list.xlsx：見出し列が場面設計シートと一致', C.SCENE.every((f) => headers.some((h) => String(h).endsWith(f.label))));
  const ex = wb.getWorksheet('記入例');
  const exOk = C.SAMPLE.scenes.every((s, i) => C.SCENE.every((f, j) => (ex.getRow(i + 3).getCell(j + 3).value || '') === (s[f.key] || '')));
  check('scene-list.xlsx：記入例シートの内容が Word 版と一致', exOk);

  console.log(`\n結果：成功 ${ok} ／ 失敗 ${ng}`);
  process.exit(ng ? 1 : 0);
})();
