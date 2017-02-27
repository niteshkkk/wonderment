var express = require('express');
var router = express.Router();
var Utils = require('../utils/utils');
var jwt = require('jsonwebtoken');
var config = require('../config');
var HTTPClient = require('httpclient');
var logger = require("../utils/logger").appLogger;
router.get('/',function(req, res){

	var resetPaswd_token = req.query.token;

	jwt.verify(resetPaswd_token,config.hash,
    function(err,decode)
    {
      if(err){
        //console.log("Error in verify token: " + err);
        logger.error(new Error("Error in verify token: " + err));
        
        var errormsg = "The link to reset your password has expired. <a href='/' class='error-link'>Click here</a> to request a new one, or contact the administrator at support@algolift.com.";
        res.render('error',{
				"message" : errormsg
			});
      }
      else{
			res.render('forgot',{
				"resetpassword_token" : resetPaswd_token
			});
		}
		}); 
});

router.post('/reset',function(req, res){
var username = req.cookies.authuser;
	var token = req.cookies.authtoken;
	var resetPaswd_token = req.body.token;
	var newPassword=req.body.newPassword;

	console.log("resetPaswd_token",resetPaswd_token)
	var options = {
	    hostname: 'localhost',
	    path: '/',
	    port: 3000,
	    secure: false,
	    method: 'POST',
	    "content-type": 'application/json',
	    headers:{
	      "Authorization" : "Bearer " + token
	    }
	 };

  	jwt.verify(resetPaswd_token,config.hash,
    function(err,decode)
    {
      if(err){
        //console.log("Error in verify token: " + err);
        logger.error(new Error("Error in verify token: " + err));
        res.status(config.codes.OK).send({'isSuccessfull': false, 'err': "Invalid attempt"});
      }
      else{
      	//var newPassword= req.query.newPassword;
        //console.log("Decoded Email from Token: " + decode.email);
        logger.info("Decoded Email from Token: " + decode.email);
        data = { error: null, email: decode.email};
		var httpClient = new HTTPClient(options);
		
	    httpClient.request('/reset?email='+decode.email+'&newPassword='+newPassword, 
	    	function (err, httpres, body) {
	    		
				var apiResponse = JSON.parse(body);
				if(httpres.statusCode != config.codes.OK){
					res.status(config.codes.BAD_REQUEST).send({'isSuccessfull': false, 'err': apiResponse.message});
				}else{
					
					res.status(config.codes.OK).send({'isSuccessfull': true, 'err': apiResponse.message, 'email': decode.email });
					
				} //end if else
			}); // end api callback function
		}
	});
});


module.exports = router;
