var restful = require('node-restful');
var mongoose = restful.mongoose;

var applicationSchema = new mongoose.Schema({

    // Todo
    title: String,
    shortTitle: String,

});

module.exports = restful.model('Application', applicationSchema);
