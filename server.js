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

app.post('/quotes', (req, res) => {
  db.collection('quotes').save(req.body, (err, result) => {
    if (err) return console.log(err)

    console.log('saved to database')
    res.redirect('/')
  })
})
