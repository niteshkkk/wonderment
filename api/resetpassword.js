var express = require('express');
var config = require('../config');
var router = express.Router();
var UserModel = require('../models/user');
var User = UserModel.userModel;
var logger = require("../utils/logger").appLogger;

router.route('/').post(function(req, res, next) {

    var email = req.query.email;
    var newPassword = req.query.newPassword;
    
    var error;
    var code;
    User.findOne({
          email: email
      }, function(error2, user) {
          if (error2) {
            logger.error(new Error(error2));
              return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                  message: error2.message
              });
          } else if (!user) {
            //console.log('NON-REGISTERED');
            logger.info("Cannot change password for a NON-REGISTERED user");
              return res.send(config.codes.BAD_REQUEST, {
                  message: "Cannot change password for a NON-REGISTERED user"
              });
          } else {
             //console.log('Reseting now');
              logger.info('Reseting now');
              user.setPassword(newPassword, function() {
                  user.save(function(error) {
                      if (error) {
                        //console.log('Error Resetting----', error);
                        logger.error(new Error('Error Resetting----' + error));
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


