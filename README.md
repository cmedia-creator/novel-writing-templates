# 創作テンプレート集（novel-writing-templates）

小説・シナリオを書く人のための、無料で使えるテンプレートを置いているリポジトリです。作成は [久賀ラトル](https://note.com/saakun777)（元ゲームシナリオライター）です。

## 小説プロット設計シート（v1.0）

出来事を並べるのではなく、場面を「だから」でつなぐためのシートです。

全体設計シート・場面設計シート・プロット診断チェックリストの3枚で、場面ごとに「主人公がしようとすること → 障害 → 選択・行動 → 結果 → だから次の場面が必要になる」を書き、物語が成立する理由を確かめます。◎（必須）だけで使い始められます。

### ダウンロード（会員登録・メールアドレスは不要です）

| ファイル | 内容 |
|---|---|
| [**まとめてダウンロード（ZIP）**](https://github.com/cmedia-creator/novel-writing-templates/releases/download/plot-sheet-v1.0/novel-plot-sheet-v1.0.zip) | 下の4ファイルと説明書きのセット |
| [空欄テンプレート（Word）](https://github.com/cmedia-creator/novel-writing-templates/releases/download/plot-sheet-v1.0/plot-sheet-blank.docx) | 記入ガイド／全体設計シート／場面設計シート（5場面）／プロット診断チェックリスト |
| [記入例（Word）](https://github.com/cmedia-creator/novel-writing-templates/releases/download/plot-sheet-v1.0/plot-sheet-sample.docx) | 架空の作品『代筆屋の一週間』で、最初から結末まで記入したもの |
| [場面一覧表（Excel）](https://github.com/cmedia-creator/novel-writing-templates/releases/download/plot-sheet-v1.0/scene-list.xlsx) | 場面設計シートと同じ項目を一行一場面で書ける表（空欄・記入例） |
| [使い方ガイド（Word）](https://github.com/cmedia-creator/novel-writing-templates/releases/download/plot-sheet-v1.0/plot-sheet-guide.docx) | どこから書くか／決まっていない項目の扱い／場面がつながらないとき／本文に進む目安／向かないケース |

Microsoft Word・Excel のほか、Google ドキュメント・スプレッドシート、LibreOffice などでも開けます。アプリによって表の幅や改ページ位置が少し変わることがあります。マクロは使っていません。

商業ゲームのシナリオ制作でプロットを作ってきた経験をもとに、いま小説を書く人が使いやすい形に作り直したものです。制作現場で使われていた書式そのものではありません。

解説記事（note）：[https://note.com/saakun777/n/nc70be469eaaa](https://note.com/saakun777/n/nc70be469eaaa)

## 利用条件

- このテンプレートの著作権は久賀ラトルにあります。
- 自分の創作のためであれば、無料で、自由に記入・編集・印刷・保存できます。項目を足したり削ったりして、自分用に作り変えても構いません。
- このテンプレートを使って書いた作品（小説・シナリオなど）の権利は、すべて書いた人のものです。商業作品・同人作品・新人賞への応募作品にも使えます。テンプレートの名前や作者を作品に書く必要はありません。
- 学校の授業、講座、創作サークルなどで、参加者に印刷して配るのは構いません（参加費を取る講座でも、テンプレート自体を販売しないかぎり可）。
- テンプレートのファイル（改変したものを含む）を、ほかのサイト・SNS・ストアなどで再配布したり、販売したり、有料の商品やサービスに組み込んだりすることはできません。人にすすめるときは、配布ページのリンクを共有してください。
- テンプレートは現状のまま提供します。使ったことによる結果について、作者は責任を負いません。

## 作り方（開発者向け）

```
npm install
npm run build    # dist/ に DOCX・XLSX・ZIP を出力
npm run verify   # 配布物の検証
```

項目の定義と記入例は plot-sheet/content.js、使い方ガイドは plot-sheet/guide.js、利用条件は plot-sheet/terms.js にあります。

© 2026 久賀ラトル
