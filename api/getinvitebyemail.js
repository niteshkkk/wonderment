var express = require('express');
var config = require('../config');
var router = express.Router();
var InvitationModel = require('../models/invitation');
var Invite = InvitationModel.invitationModel;
var UserModel = require('../models/user');
var User = UserModel.userModel;
var async = require("async");
 var logger = require("../utils/logger").appLogger;

router.route('/:email').get(function(req, res, next) {
  var email = req.params.email;
  var query={
    'sendTo.email': email
  };
  // console.log(query);

  async.waterfall([
    function(callback){
      Invite.findOne(query,{}, 
        function(err, data) {
          if (err) {
              //console.log("Error in Invite query: ",err);
              logger.error(new Error("Error in Invite query: "+ err));
              callback("No invitation found for email "+ email);
            } else {
              //console.log("Invitation Data --",data);
              logger.info("Invitation Data --" + data);              
              callback(null, data);
            }
        });  
    }, 
    function(inviteData, callback){
      User.findOne({'email':inviteData.sentBy.email},{},
          function(err, userData) {
            if (err) {
              //console.log('Error in getting User Detail of invited email id--', err);
              logger.error(new Error('Error in getting User Detail of invited email id--' + err));
              callback('Error in getting User Detail of invited email id');
            }else{
              //console.log("InvitedByUserData -- ", userData.role);
               logger.info("InvitedByUserData -- " + userData.role);
              inviteData.sentBy.role = userData.role;
              callback(null, {data: inviteData, invitedByRole: userData.role});
            }
          });
    }],
    function(err, result){
      if(err){
        logger.error(new Error(err));
        res.send(config.codes.INTERNAL_SERVER_ERROR, {
          error: err,
          data: ""
        });
      }else{
        //console.log("Final Data -- ", result);
        logger.info("Final Data -- " + result);
        res.status(config.codes.OK).send({
          data:result.data,
          invitedByRole: result.invitedByRole
        });
      }
    });
  
});

module.exports = router;
