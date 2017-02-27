var express = require('express');
var request = require('request');
var app = express();
var jwt = require('jsonwebtoken');
var config = require('../config');
var router = express.Router();
var code = 200;
var arraytwo=[];
var array=[];
var dbConfig = require('../db');
var UserModel = require('../models/user');
var User = UserModel.userModel;
var auth = require('./auth');

var InvitationModel = require('../models/invitation');
var Invite = InvitationModel.invitationModel;
var logger = require("../utils/logger").appLogger;

router.route('/').post(function(req, res, next) {
    var email = req.body.email;
    //console.log("Into Login for register. Req email = " + req.body.email);
      logger.info("Into Login for register. Req email = " + req.body.email);    
        var registerResponse = {};

        auth.register(req, res, function(err, success, resp) {
            if (err) {

                //console.log("Error processing request:" + err);
                logger.error(new Error("Error processing request:" + err));
                if (err.code)
                    code = err.code;
                else
                    code = 500;
                registerResponse.message = "Error processing request." + err.message;

                //console.log("Callback on passport register. error code=" + err.code + " msg " + err.message);
                logger.error(new Error("Callback on passport register. error code=" + err.code + " msg " + err.message));
                 res.status(code).send(registerResponse);

            } else if (!success) {
                code = 401;
                registerResponse.message = "UnAuthorized. User does not exist or password is invalid.";
                //console.log("Callback on passport register. 401");
                logger.info("Callback on passport register. 401");
                res.status(code).send(registerResponse);
            } else {

                registerResponse.message = resp.message;
                    code = 200;
                    // console.log("Callback on passport register. 200. Token =" + registerResponse.message);
                    // console.log('update invitation for email---', email);
                    logger.info("Callback on passport register. 200. Token =" + registerResponse.message);
                    logger.info('update invitation for email---' + email);
                Invite.update({'sendTo.email': email},{$set:{'status' : 'Active'}},function(err, data){
                    if(err){
                        //console.log("Invite status not updated.", err);
                        logger.error(new Error("Invite status not updated." + err));
                        res.status(500).send(registerResponse);
                    }else{
                        //console.log("Invite status updated!");
                        logger.info("Invite status updated!");
                        res.status(code).send(registerResponse);
                    }
                });
            }
            // console.log(registerResponse);
            // res.status(code).send(registerResponse); 

        });

 });

module.exports = router;
