var restful = require('node-restful');
var mongoose = restful.mongoose;

var eventSchema = new mongoose.Schema({

    // Defined in Apps4Europe vocavulary
    title: String,
    shortTitle: String,
    text: String,
    awards: Array,
    edition: Number,
    juries: Array,
    registrationLink: String,
    datasetLink: String,
    theme: String,

    // Ínherited from other vocabularies
    subEvent: String,
    superEvent: String,
    startDate: Date,
    endDate: Date,
    spatial: String,

});

module.exports = restful.model('Event', eventSchema);
