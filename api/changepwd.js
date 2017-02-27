var express = require('express');
var request = require('request');
var app = express();
var config = require('../config');
var router = express.Router();
var dbConfig = require('../db');
var UserModel = require('../models/user');
var User = UserModel.userModel;
var UserModel = require('../models/user');
var User = UserModel.userModel;
var logger = require("../utils/logger").appLogger;
router.route('/').post(function(req, res, next) {
	var email = req.body.email;
	var oldPassword = req.body.oldpwd; 
	var newPassword = req.body.newPassword;
	// console.log("email"+email);
	// console.log("oldPassword"+oldPassword);
	// console.log("newPassword"+newPassword);
  
   User.findOne({
          email: email
      },function(error2, user) {

    if (error2) {
              logger.error(new Error(error2));
              return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                  message: error2.message
              });
          } else if (!user) {
            //console.log('NON-REGISTERED');
            logger.info('NON-REGISTERED');
              return res.send(config.codes.BAD_REQUEST, {
                  message: "Cannot change password for a NON-REGISTERED user"
              });
          } else {

                    User.count({email:email,password:oldPassword},function(err, count) {
                         if (err) {
                         //console.log("error",err);
                         logger.error(new Error("Error in Finding user with email:"+ email + "---" + err));
                         return res.send(config.codes.INTERNAL_SERVER_ERROR, {});
                         } else {
                                  // if(count==0){
                                    // console.log("error2",err);
                                    // return res.send(config.codes.OK, {
                                    // status : false,
                                    // message: "email/password is incorrect!!!"  
                                    //  });                      
                                 // }
                                  // else
                                  // { 
                                      //console.log('Reseting now');
                                      logger.info('Reseting now');
                                      user.setPassword(newPassword, function() {
                                        user.save(function(error) {
                                            if (error) {
                                              //console.log('Error Resetting----', error);
                                              logger.error(new Error('Error Resetting----'+ error));
                                                return res.send(config.codes.BAD_REQUEST, {
                                                    message: error.message
                                                });
                                            } else {
                                                return res.status(config.codes.OK).send({message: 'Password Reset Successfull'});
                                            }
                                        });
                                      });

                                  //}     
                              }
                    });

                  }
      });

 });

module.exports = router;
