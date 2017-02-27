var jwt = require('jsonwebtoken');
//var cache = require('../cache/cache');
var config = require('../config');
var helper = require('sendgrid').mail;
var sg = require('sendgrid').SendGrid(config.sending.api);
//var moment = require('moment');

exports.generateToken = function(email, secret, expirationInSecs) {

    var token = jwt.sign({
        email: email
    }, secret, {
        expiresIn: expirationInSecs
    });
    return token;

}

exports.sendMail = function(fromEmail, toEmail, subject, mailBody){
	var from_email = new helper.Email(fromEmail, "ALGOLIFT");
    var to_email = new helper.Email(toEmail);
    var subject = subject;
    var content = new helper.Content("text/html", mailBody);
    var mail = new helper.Mail(from_email, subject, to_email, content);
    
    var requestBody = mail.toJSON();
    var request = sg.emptyRequest();
    request.method = 'POST';
    request.path = '/v3/mail/send';
    request.body = requestBody;
    sg.API(request, function (response) {
        return response;
    });
}




exports.loaduserLoggedin = function(req, res, done){
  var authToken = '';
  var email = req.cookies.email;
  if(req.cookies.authtoken){ authToken = req.cookies.authtoken; }
  else{
   if(req.headers && req.headers.authorization){
      var parts = req.headers.authorization.split(' ');
      
      if(parts && parts.length ==2)
      { 
        var scheme = parts[0],
          credentials = parts[1];

          if(!credentials.trim())
          {
            if(req.headers.host == "localhost:3000")
            {
               return done({userInfo :{
                  isUserLoggedIn : true,
                }
              });
            }
          }
          if (/^Bearer$/i.test(scheme)) {
            authToken = credentials;
          }
      }
   }
  }

  if(!authToken){
    return done({userInfo :{
                  isUserLoggedIn : false
                }
              });
  }


  var decodedValue = jwt.verify(authToken, config.hash);
  if(decodedValue){
    return done({"userInfo": {
      isUserLoggedIn : true,
      access_token : authToken
    }});

  }

  return done({userInfo :{
                isUserLoggedIn : false
                }
            });


}



// exports.getUtcCurrentDate = function(date) {
//     var createdDate = moment.utc(date).format("YYYY-MM-DDTHH:mm:ss.SSS") + 'Z';
//     console.log("Get UTC Current date for date= " + new Date() + " ,UTC date = " + createdDate);
//     return createdDate;
// }
