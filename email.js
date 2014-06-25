var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "CREDENTIALS",
        pass: "CREDENTIALS"
    }
});

function sendMail(mailOptions) {
  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
          console.log(error);
      }else{
          console.log("Message sent: " + response.message);
      }

      // if you don't want to use this transport object anymore, uncomment following line
      smtpTransport.close(); // shut down the connection pool, no more messages
  });
}

var email = {
  sendNotification: function(to) {
    sendMail({
      from: 'Apps4Europe <no-reply@apps4europe.eu>',
      to: to,
      subject: 'New application submitted',
      body: 'A new application has been submitted.\n\nYou can manage the applications from http://insertWebsiteAddressHere.com.'
    });
  }
};

module.exports = email;
