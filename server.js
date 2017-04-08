//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');
var express = require('express');
var path = require('path');
require('dotenv').config();

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.listen(process.env.PORT || 3000, () => {
  console.log("Listening to " + process.env.PORT || 3000);
});

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.

//(Focus on This Variable)
var url = process.env.MONGOLAB_URI;
//(Focus on This Variable)

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);
    // do some work here with the database.

    //Close connection
    db.close();
  }
});