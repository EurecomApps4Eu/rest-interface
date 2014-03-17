var restful = require('node-restful');
var mongoose = restful.mongoose;

var eventSchema = new mongoose.Schema({
    title: String,
    text: String,
});

module.exports = restful.model('Event', eventSchema);
