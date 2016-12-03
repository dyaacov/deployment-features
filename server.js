const express = require('express');
const bodyParser= require('body-parser')
const app = express();
var winston = require('winston'); // logger
var jsdom = require("jsdom"); // DOM parser
var request = require('request');

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
  jsdom.env({
    url: "https://il-web.locsec.net/accounts/login/",
    scripts: ["http://code.jquery.com/jquery.js"],
    done: function (err, window) {
      var $ = window.$;
      console.log("HN Links");
      $("td.title:not(:last) a").each(function() {
        console.log(" -", $(this).text());
      });
    }
    });
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

/*
@RequestMapping("/head")
public String head() throws IOException {

    Map<String, String> cookies = Jsoup.connect("https://il-web.locsec.net/accounts/login/").execute().cookies();
    String csrftoken = cookies.get("csrftoken");
    String sessionid = cookies.get("sessionid");
    String object = restTemplate.getForObject("https://il-web.locsec.net/accounts/login/", String.class);

    HttpHeaders requestHeaders = new HttpHeaders();
    requestHeaders.set("Referer", "https://il-web.locsec.net/accounts/login/\\?next=/");
    requestHeaders.set("Cookie", "csrftoken="+csrftoken+"; sessionid="+sessionid);

    MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
    body.set("csrfmiddlewaretoken", csrftoken);
    body.set("username", "dekely");
    body.set("password", "Lacoon01!");

    HttpEntity<?> httpEntity = new HttpEntity<Object>(body, requestHeaders);
    ResponseEntity<String> entity = restTemplate.exchange("https://il-web.locsec.net/accounts/login/", HttpMethod.POST, httpEntity, String.class);
    sessionid = entity.getHeaders().get("Set-Cookie").get(1).split(";")[0];

    requestHeaders.set("Cookie", "csrftoken="+csrftoken+"; "+sessionid);
    httpEntity = new HttpEntity<Object>(body, requestHeaders);
    Map exchange = restTemplate.exchange("https://il-web.locsec.net/api/head", HttpMethod.GET, httpEntity, Map.class).getBody();
    List<Map> list = (List<Map>) exchange.get("objects");
    return (String) list.get(0).get("HEAD");

}
*/
