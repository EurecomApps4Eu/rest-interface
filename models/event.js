var restful = require('node-restful');
var mongoose = restful.mongoose;

var eventSchema = new mongoose.Schema({

    // Defined in Apps4Europe vocavulary
    title: String,
    shortTitle: String,
    text: String,
    firstPrize: String,
    secondPrize: String,
    thirdPrize: String,
    edition: Number,
    juryMembers: [{
      name: String,
    }],
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
