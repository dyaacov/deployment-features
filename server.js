const express = require('express');
const bodyParser= require('body-parser')
const app = express();
var winston = require('winston'); // logger
var jsdom = require("jsdom"); // DOM parser

winston.configure({
    transports: [
      new (winston.transports.File)({ filename: 'logs/app.log' })
    ]
  });

app.use(bodyParser.urlencoded({extended: true}))
app.use('/static', express.static('public'))

const MongoClient = require('mongodb').MongoClient

var db
MongoClient.connect('mongodb://dekely:Jacada2008!@ds113628.mlab.com:13628/dekely', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(3000, () => {
    console.log('listening on 3000')
    winston.info('Hello again distributed logs');
  })
})


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/generate', (req, res) => {
    var features = JSON.parse('[{"id": 1, "authorName": "dekel", "text": "feature1"}]');
    db.collection('features').remove();
    db.collection('verified').remove();
    db.collection('features').save(features[0], (err, result) => {
    if (err) return res.send(err)

    console.log('saved to database')
    res.redirect('/')
  })
})

app.get('/features', (req, res) => {
    db.collection('features').find().toArray(function(err, docs){
      res.send(docs)
  });
})

app.get('/verified', (req, res) => {
    db.collection('verified').find().toArray(function(err, docs){
      res.send(docs)
  });
})

app.post('/verify/:id', (req, res) => {
  var obj = {"id": req.params.id};
  db.collection('verified').save(obj, (err, result) => {
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
