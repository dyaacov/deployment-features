const express = require('express');
const bodyParser= require('body-parser')
const app = express();
var winston = require('winston'); // logger
var jsdom = require("jsdom"); // DOM parser
var request = require('request');
var home = process.env['HOME'];
console.log(home);
var git = require('simple-git')(home+'/sandbox/dashboard');
var config = require('./config');

winston.configure({
    transports: [
      new (winston.transports.File)({ filename: 'logs/app.log' })
    ]
  });

app.use(bodyParser.json())
app.use('/static', express.static('public'))

const MongoClient = require('mongodb').MongoClient

var db
MongoClient.connect(config.db_url, (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(config.server_port, () => {
    console.log('listening on '+config.server_port)
    winston.info('Hello again distributed logs');
  })
})


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})
app.post('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/login.html')
})

app.get('/features', (req, res) => {
    db.collection('features').find().sort({ 'author_name': -1 }).toArray(function(err, docs){
      res.send(docs)
  });
})

app.get('/verified', (req, res) => {
    db.collection('verified').find().toArray(function(err, docs){
      res.send(docs)
  });
})

app.post('/verify', (req, res) => {
    console.log(req.body)
  db.collection('verified').update({id: req.body.id}, req.body, {upsert: true}, (err, result) => {
    if (err) return console.log(err)

    console.log('saved to database')
  })
})

app.delete('/verify/:id', (req, res) => {
  var obj = {"id": req.params.id};
  db.collection('verified').deleteOne(obj, (err, result) => {
    if (err) return console.log(err)

    console.log('saved to database')
  })
})

app.get('/generate', (req, res) => {
/*
    ListLogLine {
         hash: '9dff13430357be4ecb3236cc3e6c71f7b7ea38a7',
         date: '2016-12-04 16:53:37 +0200',
         message: 'deployment-features (HEAD -> master, origin/master)',
         author_name: 'Dekel Yaacov',
         author_email: 'dekely@checkpoint.com' }
      */
    db.collection('verified').drop();
    db.collection('features').drop();
    git.log({'from':'develop', 'to':'origin/master'}, function(err, log) {
            console.log(log.all);
            var lines = log.all;
            var map = {};
            lines = lines.filter(function(value){
                if(value.message.indexOf('Merge branch') == 0 || map[value.message]){
                    return false;
                }
                map[value.message] = true;
                return true;
            });
            db.collection('features').insertMany(lines);
            console.log('saved to database')
            res.redirect('/')
        });

})

app.get('/head', (req, res) => {
  request('https://il-web.locsec.net/accounts/login/', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var cookies = getCookies(response);
        var options = {
          url: 'https://api.github.com/repos/request/request',
          headers: {
            'Referer': "https://il-web.locsec.net/accounts/login/\\?next=/",
            'Cookie': "csrftoken="+cookies["csrftoken"]+"; sessionid="+cookies["sessionid"]
          }
        };
        request(options, function (error, response, body) {
        })
     }
   })

})

function getCookies(response){
  var cookies = new Object();
  var setcookie = response.headers["set-cookie"];
    if (setcookie) {
      setcookie.forEach(
        function (cookiestr) {
          cookiestr = cookiestr.split(";")[0];
          var c = cookiestr.split("=");
          cookies[c[0]] = c[1];
        }
      );
    }
    return cookies;
}
