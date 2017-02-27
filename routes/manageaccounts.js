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
		//console.log('manageaccounts_routes -- Calling getaccmanagedata api for email---' + email);
		logger.info('manageaccounts_routes -- Calling getaccmanagedata api for email---' + email);
	    httpClient.request('/getaccmanagedata/'+email , 
	    	function (err, httpres, body) {
	    		if(err){
	    			//console.log('manageaccounts_routes -- Error in http request',err);
	    			logger.error(new Error('manageaccounts_routes -- Error in http request' + err));
	    		}
	    		if(httpres.statusCode != config.codes.OK){
	    			//console.log(httpres);
						res.render('error', {
							"message": "Error"
						});
					}
	    		if(body){
					var apiResponse = JSON.parse(body);
					if(httpres.statusCode != config.codes.OK){
						res.render('manageaccounts', {
							"message": apiResponse.message
						});
					}else{
						//console.log('getaccmanagedata_api--- Rendering data to manageaccount view');
						logger.info('getaccmanagedata_api--- Rendering data to manageaccount view');
	                    //console.log(JSON.stringify(apiResponse));
						res.render('manageaccounts',{
							loggedInUser: apiResponse.loggedInUser,
							gridData: { users: apiResponse.users, invites: apiResponse.invites},
							roles: apiResponse.roles,
							titles: apiResponse.titles,
							organizations: apiResponse.organizations,
							total: apiResponse.total
						}); //end render
						//console.log('getaccmanagedata_api--- Rendering Complete to manageaccount view');
						logger.info('getaccmanagedata_api--- Rendering Complete to manageaccount view');
	                    
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
