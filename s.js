var http = require('http');
var fs = require('fs');
var crypto = require('crypto');

var db = JSON.parse(fs.readFileSync("zlib_cn.json").toString().replace(/\p{C}/gu, ""));

const key = 'e59a88bea02b5caab0e92dbaa39f72a1';
const iv = '4f4da9393c75abbc0b0942d255abd872';

http.createServer(server).listen(8080);

async function server(req, res) {
	console.log(req.url);
	try{
		if(req.method == 'GET' && req.url.startsWith("/data/")){
			fs.readFile("." + req.url, (err,data) => {
				if (err) {
					res.writeHead(404);
					res.end();
					return;
				}
				res.writeHead(200);
				res.end(encrypt(data, req.url.split("data/")[1].trim()));
			});
		}else if(req.method == 'GET' && req.url == "/"){
			fs.readFile("index.html", (err,data) => {
				if (err) {
					res.writeHead(404);
					res.end();
					return;
				}
				res.setHeader("Content-Type", "text/html; charset=utf-8"); 
				res.writeHead(200);
				res.end(data);
			});
		}else if(req.method == 'GET'){
			let filter = decodeURIComponent(req.url.slice(1));
			let data = JSON.stringify(db.filter(x => (x.title + x.author + x.zlibrary_id).toUpperCase().indexOf(filter) > -1).map((x) => { return {title: x.title, author: x.author, extension: x.extension, zlibrary_id: x.zlibrary_id};}));
			res.setHeader("Content-Type", "application/json; charset=utf-8"); 
			res.writeHead(200);
			res.end(data);
		}else{
			res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'});
			res.end('{}');
		}
	}catch(e){
		res.writeHead(404);
		res.end();
	}
}

function encrypt(data, id) {
	let hash = crypto.createHash('sha256').update(key + id).digest('hex');
	let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(hash, 'hex'), Buffer.from(iv, 'hex'));
	let encrypted = cipher.update(data);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return encrypted;
}

function decrypt(text) {
 let encryptedText = Buffer.from(text, 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted.toString();
}