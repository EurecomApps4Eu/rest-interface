var restful = require('node-restful');
var mongoose = restful.mongoose;
var Schema = mongoose.Schema;

var eventSchema = new Schema({

    // Defined in Apps4Europe vocabulary
    title: String,
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
    theme: String,
    startDate: Date,
    endDate: Date,
    location: String,
    contacts: [{
      name: String,
      email: String,
      phone: String
    }],
    organizers: [{
      name: String,
      url: String
    }],
    sponsors: [{
      name: String,
      url: String
    }],

    // Connect event to user account
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
    }

});

module.exports = restful.model('Event', eventSchema);
