var express = require('express');
var router = express.Router();
var Utils = require('../utils/utils');
var jwt = require('jsonwebtoken');
var config = require('../config');
var HTTPClient = require('httpclient');
var logger = require("../utils/logger").appLogger;

router.get('/',function(req, res){
var username = req.cookies.authuser
	
	var token = req.query.token;
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

  	jwt.verify(token,config.hash,
    function(err,decode)
    {
      if(err){
        //console.log("Error in verify token: " + err);
        logger.error(new Error("Error in verify token: " + err));
        data = {error: err, email: null};
        res.render('signup', {"message": 'Invalid Registration!'});
      }
      else{
        //console.log("Decoded Email from Token: " + decode.email);
        logger.info("Decoded Email from Token: " + decode.email);
        data = { error: null, email: decode.email};
		var httpClient = new HTTPClient(options);
		logger.info('Calling getinvitebyemail api for email---' + decode.email);
		//console.log('Calling getinvitebyemail api for email---' + decode.email);
	    httpClient.request('/getinvitebyemail/'+decode.email , 
	    	function (err, httpres, body) {
				var apiResponse = JSON.parse(body);
				if(httpres.statusCode != config.codes.OK){
					res.render('signup', {
						"message": apiResponse.error
					});
				}else{
					
					res.render('signup',{
						sendTo: apiResponse.data.sendTo,
						sentBy: apiResponse.data.sentBy,
						invitedbyrole: apiResponse.invitedByRole
					}); //end render
				} //end if else
			}); // end api callback function
		}
	});
 	


});


module.exports = router;
