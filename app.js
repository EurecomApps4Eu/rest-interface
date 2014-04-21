var express = require('express');
var cors = require('cors');
var restful = require('node-restful');
var mongoose = restful.mongoose;
var app = express();
var crypto = require('crypto');

var config = require('./config');

// Models
var Event = require('./models/event');
var Application = require('./models/application');
var User = require('./models/user');

// Globally enable CORS
app.use(cors());

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

// Check credentials on each request
// TODO: harden security
app.use(function(req, res, next) {

  if ( req.headers.authorization ) {
    var parts = req.headers.authorization.split(' ', 2);
    var token = parts[1];

    User.findOne({accessToken: token}, function(error, user) {
      if ( error || !user ) {
        res.send(400, 'Invalid access token');
      }
      else {
        req.body.owner = user._id;
      }
      next();
    });
  }
  else {
    next();
  }
});


Event.methods(['get', 'post', 'put', 'delete']).register(app, '/events');
Application.methods(['get', 'post', 'put', 'delete']).register(app, '/applications');

// Pw hash for user registration and login
function hash(password, salt) {
  var hashThis = config.secret + password + salt;
  return crypto.createHash('sha512').update(hashThis).digest('hex');
}

function beforeSaveUser(req, res, next) {

  // TODO: add additional check that user has permissions to edit this user account

  // Ensure that user is modifying only allowed fields
  var allowedFields = ['email', 'password', '_id'];
  for ( key in req.body ) {
    if ( allowedFields.indexOf(key) === -1 ) {
      delete req.body[key];
    }
  }

  crypto.randomBytes(48, function(ex, buf) {
    var salt = buf.toString('hex');
    req.body.salt = salt;
    req.body.hashedPassword = hash(req.body.password, salt);
    next();
  });
}

User.methods([
  {
    method: 'post',
    before: beforeSaveUser
  },
  {
    method: 'put',
    before: beforeSaveUser
  }
])
.register(app, '/users');

// Login
app.post('/login', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;

  function invalidLogin() {
    res.send(400, 'wrong password');
  }

  User.findOne({email: email}, function(error, user) {
    if ( !user ) {
      return invalidLogin();
    }

    // Check if password is correct
    if ( hash(password, user.salt) === user.hashedPassword ) {

      // Create new authentication token and return it
      crypto.randomBytes(48, function(ex, buf) {
        var token = buf.toString('hex');

        // TODO: ensure token is unique
        // (already specified in model to be unique, need to handle failures)

        user.accessToken = token;
        user.save();

        res.send(token);
      });

    }

    else {
      return invalidLogin();
    }
  });
});

app.get('/users/:id', function(req, res) {
  User.findOne({_id: req.params.id}, function(error, dbUser) {
    var user = {};

    ['_id', 'email', 'settings'].forEach(function(key) {
      user[key] = dbUser[key];
    });

    res.json(user);
  });
});

app.listen(process.argv[2]);
