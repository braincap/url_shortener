//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');
var express = require('express');
var path = require('path');
require('dotenv').config();

var app = express();
var url = process.env.MONGOLAB_URI;
var MongoClient = mongodb.MongoClient;
var db;
var coll;
var latest_seq = 0;

app.use(express.static(path.join(__dirname, 'public')));

MongoClient.connect(url, (err, database) => {
  if (err) { throw err; }
  db = database;
  coll = db.collection('urlmappings');
  app.listen(process.env.PORT || 3000, () => console.log("Listening to " + process.env.PORT || 3000));

});

app.get('/new/*', (req, res) => {

  if (!(/^(http){1}s{0,1}:{1}(\/\/){1}(www.){1}/.test(req.params[0]))) {
    res.send(JSON.stringify({
      "error": "Improper format. Please use (https://www.) or (http://www.)"
    }));
    return 0;
  }

  var save_object = {};
  coll.ensureIndex({ "sequence": 1 })
  console.log("New request received to store : " + req.params[0]);
  coll.find().sort({ "sequence": -1 }).limit(1).toArray((err, results) => {
    if (results.length !== 0) {
      latest_seq = results[0]["sequence"] + 1;
    } else {
      latest_seq = 0;
    }
    save_object.original_url = req.params[0];
    save_object.sequence = latest_seq;
    save_object.short_url = req.get('host') + '/' + latest_seq;
    coll.insert(save_object);
    res.send(JSON.stringify({
      original_url: save_object.original_url,
      short_url: save_object.short_url
    }));
  });
});

app.get('/:sequence', (req, res) => {
  console.log("Unshort request received for sequence " + req.params.sequence);
  console.log(typeof req.params.sequence, req.params.sequence);
  coll.find({
    "sequence": parseInt(req.params.sequence)
  }).toArray((err, results) => {
    console.log(results);
    if (results.length !== 0) {
      console.log("Redirecting to : " + results[0]['original_url']);
      res.redirect(results[0]['original_url']);
      res.end();
    } else {
      res.send(JSON.stringify({
        "error": "This url is not on the database."
      }));
    }
  });
});