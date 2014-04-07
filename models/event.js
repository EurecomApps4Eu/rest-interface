var restful = require('node-restful');
var mongoose = restful.mongoose;
var Schema = mongoose.Schema;

var eventSchema = new Schema({

    // Defined in Apps4Europe vocavulary
    title: String,
    shortTitle: String,
    text: String,
    firstPrize: String,
    firstPrizeWinners: [Schema.Types.ObjectId],
    secondPrize: String,
    secondPrizeWinners: [Schema.Types.ObjectId],
    thirdPrize: String,
    thirdPrizeWinners: [Schema.Types.ObjectId],
    edition: Number,
    juryMembers: [{
      name: String,
      email: String
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
