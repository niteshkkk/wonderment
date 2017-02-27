var express = require('express');
var router = express.Router();
var HTTPClient = require('httpclient');
var config = require('../config');
var async = require("async");
var logger = require("../utils/logger").appLogger;


router.get('/',function(req, res){
	var token = req.cookies.authtoken;
	var email = req.cookies.authuser;
	if(!email){
		res.render('index');
	}else{
	
		//console.log("In User Setting Page with email---"+email);
		logger.info("In User Setting Page with email---" + email);
		var options = {
		    hostname: 'localhost',
		    path: '/',
		    port: 3000,
		    secure: false,
		    method: 'GET',
		    "content-type": 'application/json',
		    headers:{
		      "Authorization" : "Bearer " + token
		    }
		 };

		var httpClient = new HTTPClient(options);
		//console.log('Calling getallusersbyemail api for email---' + email);
		  logger.info('Calling getallusersbyemail api for email---' + email);
	    httpClient.request('/getaccmanagedata/'+email , 
	    	function (err, httpres, body) {
				var apiResponse = JSON.parse(body);
				//console.log(apiResponse);
				if(httpres.statusCode != config.codes.OK){
					res.render('error', {
						"message": apiResponse.message
					});
				}else{
					res.render('createusersetting',{
						loggedInUser: apiResponse.loggedInUser
					}); //end render
				} //end if else
			}); // end api callback function
	//---------Grid Data Call Ends
	}
}); // end router

module.exports = router;
