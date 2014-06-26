var express = require('express');
var cors = require('cors');
var restful = require('node-restful');
var mongoose = restful.mongoose;
var app = express();
var crypto = require('crypto');
var fs = require('fs');
var exphbs  = require('express3-handlebars');
var extend = require('node.extend');

var config = require('./config');
var email = require('./email');

var S = require('string');

// Models
var Event = require('./models/event');
var Application = require('./models/application');
var User = require('./models/user');

// Globally enable CORS
app.use(cors());

// Limit file upload (and http request) size
app.configure(function() {
  app.use(express.bodyParser({
    limit: config.fileUploadLimit
  }));
});

// Serve static files
var oneDay = 86400000;
app.use('/static', express.static(__dirname + '/static', {maxAge: oneDay}));

// Required by node-restful
app.use(express.bodyParser());
app.use(express.query());

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

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
        next();
      }
    });
  }
  else {
    next();
  }
});

function afterPostApplication(req, res, next) {
  sendNotification(req, res);
  handleImages(req, res);
  next();
}

function afterPutApplication(req, res, next) {
  handleImages(req, res);
  next();
}

function sendNotification(req, res) {
  // Shall we send a notification e-mail to owner of connected event?
  if ( !res.locals.bundle.published ) {
    Event.findOne({_id: res.locals.bundle.connectedEvent}, function(error, event) {

      if ( !event || !event.owner ) {
        return;
      }

      User.findOne({_id: event.owner}, function(error, owner) {
        if ( owner && owner.emailNotifications ) {
          email.sendNotification(owner.email);
        }
      });

    });
  }
}

function validImageExtension(filename) {
  var parts = filename.split('.');
  var extension = parts[parts.length - 1].toLowerCase();

  return ['jpg', 'jpeg', 'png', 'gif'].indexOf(extension) !== -1;
}

function handleImages(req, res) {

  var id = res.locals.bundle._id;

  var cleanedImages = [];

  if ( req.body.images ) {

    req.body.images.forEach(function(image, key) {

      if ( image.src ) {
        cleanedImages.push(image.src);
      }

      // Image was just uploaded => move from tmp storage to permanent storage
      else if ( image.tmpName && validImageExtension(image.name) ) {
        var folder = __dirname + '/static/images/' + id;
        var newPath = folder + '/' + image.name;

        cleanedImages.push(config.restURI + '/static/images/' + id + '/' + image.name);

        fs.readFile('/tmp/' + image.tmpName, function (err, data) {

          // Ensure directory exists
          if ( !fs.existsSync(folder) ) {
            fs.mkdirSync(folder);
          }

          fs.writeFile(newPath, data, function(error) {
            // TODO: check for error
          });
        });
      }
    });

  }

  Application.findOne({_id:id}, function(err, doc) {
    doc.images = cleanedImages;
    doc.save();
  });
}

Event.methods([
  {method: 'get', before: function(req, res, next) {
    // Only return events belonging to this user
    if ( req.body.owner ) {
      req.quer._conditions.owner = req.body.owner;
    }
    next();
  }},
  'post',
  'put',
  'delete'
]).register(app, '/events');

Application.methods([
  {method: 'get', before: function(req, res, next) {
    // Only return applications belonging to this user
    if ( req.body.owner ) {
      req.quer._conditions.owner = req.body.owner;
    }
    next();
  }},
  {method: 'post', after: afterPostApplication},
  {method: 'put', after: afterPutApplication},
  'delete'
]).register(app, '/applications');

// Pw hash for user registration and login
function hash(password, salt) {
  var hashThis = config.secret + password + salt;
  return crypto.createHash('sha512').update(hashThis).digest('hex');
}

function beforeSaveUser(req, res, next) {

  // TODO: add additional check that user has permissions to edit this user account

  // Ensure that user is modifying only allowed fields
  var allowedFields = ['email', 'password', '_id', 'emailNotifications'];
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

  if ( req.params.id === 'me' ) {
    req.params.id = req.body.owner;
  }

  User.findOne({_id: req.params.id}, function(error, dbUser) {
    var user = {};

    ['_id', 'email', 'emailNotifications'].forEach(function(key) {
      user[key] = dbUser[key];
    });

    res.json(user);
  });
});

// Photo upload
app.post('/images', function(req, res) {
  var tmpPathParts = req.files.file.path.split('/');
  res.send(200, tmpPathParts[tmpPathParts.length - 1]);
});

function turtleEscapeSingle(value) {
  if ( typeof value !== "string" ) {
    return value;
  }

  value = value.replace(/"/g, '\\"');

  // Strip tags
  value = S(value).stripTags();

  return value;
}

function formatDate(dateObj) {
  return dateObj.toISOString().substring(0, 10);
}

function turtleEscape(origEvent) {
  var event = extend({}, origEvent);

  for ( var key in event ) {
    event[key] = turtleEscapeSingle(event[key]);
  }

  return event;
}

// RDF output
app.get('/rdf/event/:id', function(req, res) {

  Event.findOne({_id: req.params.id}, function(error, event) {

    if ( error || !event ) {
      res.send(404);
    }
    else {
      // Should we specify correct content type (won't open in browser anymore)?
      // res.setHeader('Content-Type', 'application/x-turtle; charset=utf-8');
      event.rootUrl = config.restURI;

      // Fix dates
      event.startDateF = formatDate(event.startDate);
      event.endDateF = formatDate(event.endDate);

      // Need to escape all properties
      event = turtleEscape(event);

      // Find all connected applications
      Application.find({connectedEvent: req.params.id}, function(error, apps) {
        if ( error ) {
          // TODO
        }
        else {
          event.connectedApps = apps;
          res.render('event', event);
        }
      });
    }

  });

});

app.get('/rdf/application/:id', function(req, res) {

  Application.findOne({_id: req.params.id}, function(error, app) {

    if ( error || !app ) {
      res.send(404);
    }
    else {
      // Should we specify correct content type (won't open in browser anymore)?
      // res.setHeader('Content-Type', 'application/x-turtle; charset=utf-8');
      app.rootUrl = config.restURI;

      // Need to escape all properties
      app = turtleEscape(app);

      res.render('application', app);
    }

  });

});

app.listen(process.argv[2]);
