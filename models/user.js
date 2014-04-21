var restful = require('node-restful');
var mongoose = restful.mongoose;
var Schema = mongoose.Schema;

var userSchema = new Schema({

    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
      required: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },

    // use tmp token instead of sending
    // the password with each request
    accessToken: {
      type: String,
      unique: true,
      sparse: true,
    },

    emailNotifications: {
      type: Boolean,
      default: true,
    },

});

module.exports = restful.model('User', userSchema);
