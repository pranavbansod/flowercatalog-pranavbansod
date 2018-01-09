let fs = require('fs');
const timeStamp = require('./time.js').timeStamp;
const http = require('http');
const WebApp = require('./webapp');

let allGuestData = JSON.parse(fs.readFileSync('./data/allGuestData.json'));

const getContentType = function(filename) {
  let extension = filename.slice(filename.lastIndexOf('.'));
  let contentType = {
    '.html':'text/html',
    '.jpg':'image/jpg',
    '.css':'text/css',
    '.js':'text/js',
    '.gif':'image/gif',
    '.pdf':'document/pdf',
    '.ico':'image/ico'
  }
  return contentType[extension];
};

let toString = (obj)=>JSON.stringify(obj,null,2);

const logRequest = (req,res)=>{
  let text = ['------------------------------',
    `${timeStamp()}`,
    `${req.method} ${req.url}`,
    `HEADERS=> ${toString(req.headers)}`,
    `COOKIES=> ${toString(req.cookies)}`,
    `BODY=> ${toString(req.body)}`,''].join('\n');
  fs.appendFile('request.log',text,()=>{});
  // console.log(`${req.method} ${req.url}`);
};

const processForFileFound = function(req,res,filename) {
  let contentType = getContentType(filename);
  res.setHeader('Content-Type',contentType);
  res.statusCode = 200;
  res.write(fs.readFileSync(filename))
}

const processForPageNotFound = function(req,res) {
  res.statusCode = 404;
  res.write("Page Not Found")
}

const storeData = function(data) {
  let date = new Date();
  let parsedData = data;
  parsedData['date'] = date.toLocaleString();
  allGuestData.unshift(parsedData);
  let dataInString = JSON.stringify(allGuestData);
  fs.writeFileSync('./data/allGuestData.json',dataInString,'utf-8');
  let dataToBeSend = "let allGuestData = " + dataInString
  fs.writeFileSync('./public/js/allGuestData.js',dataToBeSend,'utf-8');
};


const processQuery = function(req,res,filename) {
  let dataInString = "";
  storeData(req.body)
  res.statusCode=302;
  res.setHeader('location','guestBook.html');
}


const fileServer = function(req,res) {
  let filename = "./public" + req.url;
  if(filename=="./public/") {
    filename = "./public/index.html";
  }
  if(filename.startsWith("./public/storeComment")) {
    processQuery(req,res,filename);
  }
  else if(fs.existsSync(filename)) {
    processForFileFound(req,res,filename);
  } else {
    processForPageNotFound(req,res);
  }
  res.end();
};

let app = WebApp.create();
app.addPreProcessor(logRequest);
app.addPostProcessor(fileServer);



const PORT = 8000;
let server = http.createServer(app);
server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));