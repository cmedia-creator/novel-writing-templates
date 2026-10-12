// ローカル確認用の静的サーバー（127.0.0.1:8765）
const http=require('http'),fs=require('fs'),path=require('path');const root=path.join(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
http.createServer((q,r)=>{const p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!p.startsWith(root)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(r);}).listen(8765,'127.0.0.1');
