const express = require('express')
const path = require('path')
const multer = require('multer');
const fs = require('fs');
const crypto = require("crypto");
const { getClientIp, mw } = require("request-ip");
const upload = multer({ dest: 'uploads/' });
var maxsize = 1073741824*25; //合計の最大サイズ
var size = 0;
// var maxfilesize = 1073741824; //1073741824bytes = 1GB
const PORT = parseInt(process.argv[2])

const file = {files:[]}
if(fs.existsSync("./file.json"))
{
    const file = JSON.parse(fs.readFileSync('./file.json', 'utf8'));
}
var files = file["files"]

for(let i = 0;i < files.length;i++)
{
    size += files[i].size;
}

const app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


app.get('/', (req, res) => {
	res.render("fileserver",{"files":files.filter((e)=>getClientIp(req)==e.ip)})
})


app.delete("/delete/:token",(req,res) => {
    const token = req.params["token"];
    const file = files.find(e=>e.token.admin===token || e.token.del===token);
    if(file!=undefined)
    {
        const filename = file.filename;
        if(fs.existsSync("./uploads/" + filename))
        {
            console.log("[-]","Delete","filename",file.name,"IP:",getClientIp(req));
            fs.unlinkSync("./uploads/" + filename);
            files = files.filter(e=>e.filename!=filename)
            res.send({"status":"success"});
        }else{
            res.send({"status":"failed","message":"not exists"})
        }
    }else{
        res.send({"status":"failed","message":""})
    }
});


function* range(start, end) {
    for(let i = start; i <= end; i++) {
        yield i;
    }
}
    
// Whether text or not. Besed on file (1) behavior
// (from: https://stackoverflow.com/a/7392391/2885946)
function isText(array) {
    const textChars = [7, 8, 9, 10, 12, 13, 27, ...range(0x20, 0xff)];
    return array.every(e => textChars.includes(e));
}

  
var clientIP = (req)=>req.headers['x-forwarded-for'] || req.socket.remoteAddress;

app.use(mw());


app.post('/upload', upload.single('file'), function (req, res, next) {
    
    var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const file  = req.file;
    if(file!=undefined)
    {
        if(file.size > maxsize - size){ // 1073741824byte=1GB
            res.send("ファイルサイズが大きすぎます。<a href='/'>戻る</a>")
            return;
        }
        console.log("[+]","Upload","filename",file.originalname,"IP:",ip);
        const admin_token = crypto.randomUUID();
        const read_token = crypto.randomUUID();
        const del_token = crypto.randomUUID();

        files.push({
            ip:getClientIp(req),
            filename:file.filename,
            path:"./uploads/" + file.filename,
            name:file.originalname,
            size:file.size,
            token:{ admin:admin_token,read:read_token,delete:del_token }
        });
        res.redirect("/");
    }
});
app.get('/download/:token', (req,res) => {
    const token = req.params["token"];
    const file = files.find(e=>e.token.admin===token || e.token.read===token);
    if(file!=undefined){
        res.download("./uploads/" + file.filename, file.name);
    }else{
        res.send("トークンと一致するファイルがありませんでした。\nトークンが存在しないか、ファイルが削除された可能性があります。<a href='/'>戻る</a>")
    }
})
app.get('/info/:token', (req,res) => {
    const token = req.params["token"];
    const file = files.find(e=>e.token.admin===token || e.token.read===token);
    if(file!=undefined)
    {
        const filename = file.filename;
        if(fs.existsSync('./uploads/' + filename))
        {
            fs.readFile("./uploads/" + filename, (err, result) => {
                if (err) throw err;

                const u8 = new Uint8Array( result.buffer );
                var js = {};
                js["file"] = {...file};
                js["file"]["token"] = file.token.admin===token ? {admin:token,delete:file.token.delete,read:file.token.read} : {read:token}
                if(isText(u8))
                {
                    js["text"] = result;
                }
                js["istext"] = isText(u8);
                res.render("info",js);
            });
        }else{
            res.send({"status":"failed","message":"not exists"});
        }
    }else{
        res.send("トークンと一致するファイルがありませんでした。\nトークンが存在しないか、ファイルが削除された可能性があります。<a href='/'>戻る</a>");
    }

    
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

process.on("exit", exitCode => {
    console.log("EXIT")
    fs.writeFileSync('./file.json', JSON.stringify({"files":files},null , "\t"));
});
process.on("SIGINT", ()=>process.exit(0));
