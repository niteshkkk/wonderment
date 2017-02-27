var express = require('express');
var jwt = require('jsonwebtoken');
var config = require('../config');
var router = express.Router();
var Utils = require('../utils/utils');
var UserModel = require('../models/user');
var User = UserModel.userModel;
 var logger = require("../utils/logger").appLogger;

router.route('/').post(function(req, res, next) {
        //var loginResponse = { message: 'Email sent'};
        // console.log("Into /auth/forget password for email = " );
        // console.log("Into /auth/forget password for email = " + req.body.email);
        logger.info("Into /auth/forget password for email = " + req.body.email);
            User.findOne({
                email: req.body.email
            },{}, function(err, user) {

                if (err) {
                    //console.log('Error /auth/forget. No account with that email address exists, Err =' + err.message);
                    logger.error(new Error('Error /auth/forget. No account with that email address exists, Err =' + err.message));
                    return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                        message: 'Error /auth/forget. No account with that email address exists, Err =' + err.message
                    });

                } else if (!user) {
                    //console.log('Email not found on /auth/forget. No account with that email address exists.');
                    logger.error(new Error('Email not found on /auth/forget. No account with that email address exists.'));
                    return res.send(config.codes.BAD_REQUEST, {
                        message: 'No account exists with this Email Id.'
                    });

                } else if(user.status === "Inactive"){
                //console.log('User is not an active user', user.status);
                logger.info('User is not an active user', user.status);
                return res.send(config.codes.FORBIDDEN,{
                    message: 'Your account seems to be inactive. Please contact site administrator.'
                });
                
                } else {
                  var token= Utils.generateToken(req.body.email,config.hash,900); 
                  //console.log("Sending Email",req.body.email);            
                  logger.info("Sending Email" + req.body.email);
                  var from_email = config.adminemail;
                  var to_email = req.body.email;
                  var subject = "Reset Password";

                  res.render('email/resetpass', {
                      'name': user.firstName+" "+user.lastName,
                      'token': token,
                      'url': config.site
                  }, function(err, html) {
                      if(err){
                          //console.log('Error in Sending Mail', err);
                          logger.error(new Error('Error in Sending Mail' + err));
                          res.send(config.codes.INTERNAL_SERVER_ERROR, {message: 'Error in Sending mail. Please try again in a while.'});
                      }
                      Utils.sendMail(from_email, to_email, subject, html);
                      //console.log('Mail send successfully.');
                      logger.info('Mail send successfully.');
                      res.send(config.codes.OK, {message: 'Mail sent'});
                  });
                }
            });
    }); 

module.exports = router;