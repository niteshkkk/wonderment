var express = require('express');
var request = require('request');
var app = express();
var config = require('../config');
var router = express.Router();
var dbConfig = require('../db');
var UserModel = require('../models/user');
var User = UserModel.userModel;
var logger = require("../utils/logger").appLogger;

        router.route('/').post(function(req, res, next) {

            var email = req.body.email;
            var newPassword = req.body.newPassword;
            var error;
            var code;
            User.findOne({
                  email: email
              }, function(error2, user) {
                  if (error2) {
                    logger.error(new Error(error2));
                      return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                          message: error2
                      });
                  } else if (!user) {
                    logger.info("Cannot change password for a NON-REGISTERED user");
                      return res.send(config.codes.BAD_REQUEST, {
                          message: "Cannot change password for a NON-REGISTERED user"
                      });
                  } else {
                      user.setPassword(req.body.newPassword, function() {
                          user.save(function(error) {
                              if (error) {
                                logger.error(new Error(error));
                                  return res.send(config.codes.BAD_REQUEST, {
                                      message: error.message
                                  });
                              } else {
                                logger.info('Password Reset Successfull');
                                  return res.status(config.codes.OK).send({message: 'Password Reset Successfull'});
                              }
                          });
                      });
                  }
              });
        });

module.exports = router;


