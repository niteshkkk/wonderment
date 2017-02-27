var express = require('express');
var router = express.Router();
var HTTPClient = require('httpclient');
var config = require('../config');
var async = require("async");
var logger = require("../utils/logger").appLogger;

router.get('/',function(req, res){
	var token = req.cookies.authtoken;
	var email = req.cookies.authuser;
	var name = req.cookies.authname;
	var role=req.cookies.utype;
	
	if(!email){
		res.render('index');
	}else{
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


	//---------Call for Grid Data Starts
		var httpClient = new HTTPClient(options);
		
	    httpClient.request('/api/usertitle/?email='+ encodeURIComponent(email) , 
	    	function (err, httpres, body) {
	    		if(err){
	    			//console.log('Error in http request',err);
	    			logger.error(new Error('Error in http request' + err));
	    		}
	    		if(httpres.statusCode != config.codes.OK){
	    			//console.log(httpres);
						res.render('error', {
							"message": JSON.parse(body)
						});
					}
	    		if(body){
					var apiResponse = JSON.parse(body);
					if(httpres.statusCode != config.codes.OK){
						res.render('error', {
							"message": apiResponse.message
						});
					}else{
						
						res.render('contactus',{
							loggedInUser: apiResponse.data,
							
						}); //end render
						
	                    
					} //end if else
				}else{
					res.render('error', {
							"message": err
						});
				}
			}); 
	}
}); 

module.exports = router;

