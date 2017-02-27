var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var config = require('../config');
var validator = require('../validator/apiValidator');
var code = 200;
var auth = require('./auth');
var UserModel = require('../models/user');
var User = UserModel.userModel;

var InvitationModel = require('../models/invitation');
var Invite = InvitationModel.invitationModel;
var logger = require("../utils/logger").appLogger;

module.exports = function(passport){

    router.route('/').post(function(req, res, next) {
        //console.log("Into Login for register. Req email = " + req.query.email);
        logger.info("Into Login for register. Req email = " + req.query.email);
        var registerResponse = {};

        auth.register(req, res, function(err, success, resp) {
            if (err) {
                //console.log("ERRRRRRRRR .. codd" + err);
                logger.error(new Error("Error in processing request" + err));
                if (err.code)
                    code = err.code;
                else
                    code = 500
                registerResponse.message = "Error processing request." + err.message;

                //console.log("Callback on passport register. error code=" + err.code + " msg " + err.message);
                logger.error(new Error("Callback on passport register. error code=" + err.code + " msg " + err.message));

            } else if (!success) {
                code = 401;
                registerResponse.message = "UnAuthorized. User does not exist or password is invalid.";

                //console.log("Callback on passport register. 401");
                logger.info("Callback on passport register. 401");
            } else {

                registerResponse = resp;
                code = 200;
                // console.log("Callback on passport register. 200. Token =" + registerResponse.token);
                // console.log('update invitation for email---',req.query.email);
                logger.info("Callback on passport register. 200. Token =" + registerResponse.token);
                logger.info('update invitation for email---' + req.query.email);
                Invite.update({'sendTo.email': req.query.email},{$set:{'status' : 'Active'}},function(err, data){
                    if(err){
                        //console.log("Invite status not updated.", err);
                        logger.error(new Error("Invite status not updated."+ err));
                        res.status(500).send(registerResponse);
                    }else{
                        //console.log("Invite status updated!");
                         logger.error(new Error("Invite status updated!"));
                        res.status(code).send(registerResponse);
                    }
                });

            }
            

        });

    }); // end of post func


    return router;
} // end exports module