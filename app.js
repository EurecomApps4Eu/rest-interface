var express = require('express');
var restful = require('node-restful');
var mongoose = restful.mongoose;
var app = express();

var config = require('./config');

// Models
var Event = require('./models/event');

// Required by node-restful
app.use(express.bodyParser());
app.use(express.query());

var testMode = process.argv.indexOf('--test') !== -1;
var db;

if ( testMode ) {
  // Clean existing data before tests
  db = config.db.testDb;
  mongoose.connect(db);

  // TODO
  //mongoose.connection.db.dropDatabase('test', function(err, result) {
  //  console.log(err, result);
  //});
}
else {
  db = config.db.productionDb;
  mongoose.connect(db);
}

Event.methods(['get', 'post', 'put', 'delete']).register(app, '/events');

app.listen(process.argv[2]);
