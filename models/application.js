var restful = require('node-restful');
var mongoose = restful.mongoose;

var applicationSchema = new mongoose.Schema({

    // Todo
    title: String,
    text: String,

});

module.exports = restful.model('Application', applicationSchema);
