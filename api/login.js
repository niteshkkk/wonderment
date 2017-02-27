var express = require('express');
var jwt = require('jsonwebtoken');
var config = require('../config');
//MySQL Code
var express = require('express');
var router = express.Router();
var mysql= require('mysql');
//MySQL Code
var validator = require('../validator/apiValidator');
var router = express.Router();
var code = 200;
var arraytwo=[];
var array=[];
var dbConfig = require('../db');
var logger = require("../utils/logger").appLogger;
module.exports = function(passport){
	
	router.route('/').post(function(req, res, next) {
		
		validator.validateLogin(req, res);
	
		var errors = req.validationErrors();
        if (errors) {

            //console.log("Found errors on registering email = " + req.body.email + " ,password="+req.body.password+",Errors = " + errors[0].msg);
            logger.error(new Error("Found errors on registering email = " + req.body.email + " ,password="+req.body.password+",Errors = " + errors[0].msg));
            res.send(config.codes.BAD_REQUEST, "Error processing request. " + errors[0].msg);

        }

        var loginResponse = {};

        passport.authenticate('local', function(err, success, authResponse){
        	if (err) {
                logger.error(new Error("Error processing request..."));
                code = 500;
                loginResponse.message = "Error processing request. " + err.message;
                // console.log(err.message);
                // console.log("Callback on passport authenticate. 500");

            } else if (!success) {
                code = authResponse.code;
                loginResponse.message = authResponse.message;
                logger.info(authResponse);
                logger.info("Callback on passport authenticate. 401");
                // console.log(authResponse);
                // console.log("Callback on passport authenticate. 401");
            } else {
                code = 200;
                logger.info("Login module is working perfectly");
                logger.info(authResponse);
                // console.log("Login module is working perfectly");
                // console.log(authResponse);
                loginResponse = authResponse;
            }
           res.status(code).send(loginResponse);
        })(req, res, next); // end passport authentication

	});	// end login router

	return router;
} // end exports module