let fs = require('fs');
const timeStamp = require('./time.js').timeStamp;
const http = require('http');
const WebApp = require('./webapp');

let registered_users = [{userName:'prateikp',name:'Pratik Patel'}, {userName:'pranavb',name:'Pranav Bansod'}];
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
  let user = registered_users.find(u=>u.userName==req.body.userName);
  console.log(user);
  if(!user) {
    res.redirect('/login.html');
    return;
  }
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

let loadUser = (req,res)=>{
  let sessionid = req.cookies.sessionid;
  let user = registered_users.find(u=>u.sessionid==sessionid);
  if(sessionid && user){
    req.user = user;
  }
};

let redirectLoggedInUserToIndex = (req,res)=>{
  if(req.urlIsOneOf(['/','/login.html']) && req.user) res.redirect('/index.html');
}

app.post('/login.html',(req,res)=>{
  let user = registered_users.find(u=>u.userName==req.body.userName);
  res.setHeader('Set-Cookie',`logInFailed=false`);
  if(!user) {
    res.setHeader('Set-Cookie',`logInFailed=true`);
    res.redirect('/login.html');
    return;
  }
  let sessionid = new Date().getTime();
  res.setHeader('Set-Cookie',`sessionid=${sessionid}`);
  user.sessionid = sessionid;
  res.redirect('/index.html');
});

app.get('/logout',(req,res)=>{
  res.setHeader('Set-Cookie',['logInFailed=false',`Expires=${new Date(1).toUTCString()}`,`sessionid=0`]);
  delete req.user.sessionid;
  res.redirect('/login.html');
});

app.addPreProcessor(logRequest);
app.addPreProcessor(loadUser);
app.addPreProcessor(redirectLoggedInUserToIndex);
app.addPostProcessor(fileServer);



const PORT = 8000;
let server = http.createServer(app);
server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
