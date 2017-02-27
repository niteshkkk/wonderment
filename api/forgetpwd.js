var express = require('express');
var app = express();
var router = express.Router();

var config = require('../config');
var dbConfig = require('../db');
var UserModel = require('../models/user');
var User = UserModel.userModel;
var SendGrid = require('sendgrid').SendGrid;
var sendgrid = new SendGrid(config.sending.user, config.sending.key);

var Utils = require('../utils/utils');
            
router.route('/').post(function(req, res, next) {
  var email = req.body.email;
  var token = Utils.generateToken(email, secret, config.expiresInSec);
  console.log('Forgot Password for email: ' + email);
  User.count({
    email:email
  },
    function(err, count) {
       if (err) {
        console.log('No account with that email address exists, Err =' + err.message);
        var error = get400Error('No account with that email address exists.');
        //return res.status(error.code).send(error.message);
        return res.send(error.code, {
            message: error.message
        });
       } else {
          if(count==0){
            console.log('Email not found. No account with that email address exists.');
            var error = get400Error('Email not found. No account with that email address exists.');
            return res.send(error.code, {
                message: error.message
            });                      
          }
          else {  
            sendgrid.send({
                to:       email,
                from:     'noreply@noreply.com',
                subject:  'Forget Password',
                text:     config.site+'/forgot/'+token
            }, function(status) {
                if (status) {
                  return res.send(config.codes.OK, {
                    status: true,
                    message: "An email has been send to your email id to reset password"
                  });
                }
            });  
          }     
        }
  });
 });

module.exports = router;
