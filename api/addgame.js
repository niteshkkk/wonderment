var express = require('express');
var request = require('request');
var app = express();
var async = require("async");
var jwt = require('jsonwebtoken');
var config = require('../config');
var router = express.Router();
var code = 200;
var dbConfig = require('../db');
var UserModel = require('../models/user');
var User = UserModel.userModel;
var TitleModel = require('../models/title');
var Title = TitleModel.titleModel;
var InvitationModel = require('../models/invitation');
var Invite = InvitationModel.invitationModel;
var logger = require("../utils/logger").appLogger;


router.route('/').post(function(req, res, next) {
var email = req.body.email;
var name = req.body.title;
var organization = req.body.organization;
var isinvite = req.body.isinvite;

var titles = {name: name};

    async.parallel([function(callback){
        if(isinvite){
            Invite.update({'sendTo.email':email},{$push:{'sendTo.titles':titles}},
              function(err, data) {
                //console.log(err);
                logger.error(new Error(err));
                if (err) {
                  return callback('Error in update user async call-----'+err);
                }  else {
                  return callback(null,data);
                }
            });
        }else{
            User.update({email:email},{$push:{titles:titles}},
              function(err, data) {
                //console.log(err);
                 logger.error(new Error(err));
                if (err) {
                  return callback('Error in update user async call-----'+err);
                }  else {
                  return callback(null,data);
                }
            });
        }
    },function(callback){
        Title.count({$and:[{'organization.name':organization},{'organization.titles.name':name}]},function(err, count) {
            if (err) {
                //console.log("error",err);
                logger.error(new Error(err));
                return callback('Error in update title async call-----'+err);
            } else {
                if(count==0){
                    Title.update({'organization.name':organization},{$push:{'organization.titles':{name:name}}},function(err, data) {
                        if (err) {
                            logger.error(new Error(err));
                            return callback('Error in update title collection async call-----'+err);
                        }  else {   
                           // console.log(data);
                            return callback(null, data);
                        }
                    });
                }
                else {  
                    return callback(null, count);
                }     
            }
        });
    }],function(err, results){
           if (err) {
                //console.log("Error api / addgame--- ",err);
                 logger.error(new Error("Error api / addgame--- ",err));
                return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                    message: "Error api / addgame."
                });
            }  else {
                if(results){                    
                    //console.log(results)
                    logger.info("Title assigned to user successfully!");
                    return res.status(config.codes.OK).send({
                        status: true,
                        message: 'Title assigned to user successfully!'
                    }); // end of res send
                }else{
                    logger.info("No Title assigned to user!");
                    return res.status(config.codes.INTERNAL_SERVER_ERROR).send({
                        status: false,
                        message: 'No Title assigned to user!'
                    }); // end of res send
                }
            }
    });   


});

module.exports = router;
