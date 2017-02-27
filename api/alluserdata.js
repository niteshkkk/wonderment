var express = require('express');
var request = require('request');
var app = express();
var async = require("async");
var config = require('../config');
var router = express.Router();
var utils = require('../utils/utils');

var UserModel = require('../models/user');
var User = UserModel.userModel;
var fetchFields='firstName lastName email registrationDate organization status role titles';

var InvitationModel = require('../models/invitation');
var Invite = InvitationModel.invitationModel;
 var logger = require("../utils/logger").appLogger;


router.route('/').get(function(req, res, next) {
	var email = req.cookies.authuser;
	var loggedInUserRole = req.cookies.utype;
	// Create User Query	
	var userQuery = [];
	if(loggedInUserRole != 'SuperAdmin' && email){
		userQuery.push({'invitedBy.email': email});
	}

	if(req.query.role && req.query.role != 'All'){
		userQuery.push({'role': req.query.role});
	}

	if(req.query.status && req.query.status != 'All'){
		var status=req.query.status;
		var statusArray = status.split(',');
		var statusQuery = {};
		//console.log('status',JSON.stringify(statusArray));
		if(statusArray.length > 0){
			var statusQueryArray = [];
			for(i=0;i<statusArray.length;i++){
				statusQueryArray.push({'status': statusArray[i]});
			}
			//console.log('statusQueryArray',JSON.stringify(statusQueryArray));
			statusQuery['$or'] = statusQueryArray;
			//console.log('statusQuery:',JSON.stringify(statusQuery));
			userQuery.push(statusQuery);
			//console.log('userQuery:',JSON.stringify(userQuery));
		}else{
			userQuery.push({'status': status});
		}


	}
	
	if(req.query.organization && req.query.organization != 'All'){
		var organization=req.query.organization;
		var organizationArray = organization.split(',');
		var organizationQuery = {};
		//console.log('organization',JSON.stringify(organizationArray));
		if(organizationArray.length > 0){
			var organizationQueryArray = [];
			for(i=0;i<organizationArray.length;i++){
				//console.log('organization',organizationArray[i]);
				organizationQueryArray.push({'organization': organizationArray[i]});
			}
			organizationQuery['$or'] = organizationQueryArray;
			userQuery.push(organizationQuery);
		}else{
			userQuery.push({'organization': organization});
		}
		//console.log('userQuery.organization',userQuery);
	}

	if(req.query.titles && req.query.titles != 'All'){
		var title=req.query.titles;
		var titleArray = title.split(',');
		var titleQuery = {};
		if(titleArray.length > 0){
			var titleQueryArray = [];
			for(i=0;i<titleArray.length;i++){
				titleQueryArray.push({'titles.name': titleArray[i]});
			}
			titleQuery['$or'] = titleQueryArray;
			userQuery.push(titleQuery);
		}else{
			userQuery.push({'titles.name': title});
		}
	}

	 var fromDate = new Date(req.query.registrationDate);
	// console.log('fromDate---', fromDate);	
	// console.log('Year---', fromDate.getFullYear());
	// console.log('Month---', fromDate.getMonth());
	// console.log('Day---', fromDate.getDate());

	 var toDate = new Date(req.query.registrationEndDate);
	// console.log('fromDate---', toDate);	
	// console.log('Year---', toDate.getFullYear());
	// console.log('Month---', toDate.getMonth());
	// console.log('Day---', toDate.getDate());


	userQuery.push({'registrationDate': {
		'$gte' : new Date(new Date(fromDate.getFullYear(),fromDate.getMonth(),fromDate.getDate()-1)),
		'$lte' : new Date(new Date(toDate.getFullYear(),toDate.getMonth(),toDate.getDate()+1))
	}});

	// userQuery.registrationDate.$gt = utils.getUtcCurrentDate(req.query.registrationDate);
	// userQuery.registrationDate.$lt = utils.getUtcCurrentDate(req.query.registrationEndDate);


	//console.log("query---------->>>>>>", JSON.stringify(userQuery));
	// User Query END

	// Create Invite Query
	var inviteQuery=[];
	//console.log('Role---',loggedInUserRole);
	if(loggedInUserRole != 'SuperAdmin' && email){
		//inviteQuery.sentBy = {};
		inviteQuery.push({'sentBy.email': email});
	}

	if(req.query.role && req.query.role != 'All'){
		var role=req.query.role;
		//inviteQuery.sendTo = {};
		inviteQuery.push({"sendTo.role" : role});
	}
	
	

	//console.log(req.query.status.indexOf('Invited'));		
	if(req.query.status === 'All'){
		inviteQuery.push({'status' : 'Invited'});
	}else if(req.query.status.indexOf('Invited') >= 0){
		inviteQuery.push({'status' : 'Invited'});
	}else {
		inviteQuery.push({'status' : ''});
	}

	if(req.query.organization && req.query.organization != 'All'){

		var organization=req.query.organization;
		var organizationArray = organization.split(',');
		var organizationQuery = {};
		if(organizationArray.length > 0){
			var organizationQueryArray = [];
			for(i=0;i<organizationArray.length;i++){
				organizationQueryArray.push({'sendTo.organization': organizationArray[i]});
			}
			organizationQuery['$or'] = organizationQueryArray;
			inviteQuery.push(organizationQuery);
		}else{
			//inviteQuery.sendTo = {};
			inviteQuery.push({'sendTo.organization': organization});
		}
	}

	if(req.query.titles && req.query.titles != 'All'){

		var title=req.query.titles;
		var titleArray = title.split(',');
		var titleQuery = {};
		if(titleArray.length > 0){
			var titleQueryArray = [];
			for(i=0;i<titleArray.length;i++){
				titleQueryArray.push({'sendTo.titles.name': titleArray[i]});
			}
			titleQuery['$or'] = titleQueryArray;
			inviteQuery.push(titleQuery);
		}else{
			inviteQuery.push({'sendTo.titles.name' : title});
		}
	}
    //console.log("invtequery---------->>>>>>" + JSON.stringify(inviteQuery));

    //Invite Query End


	async.parallel([function(callback){
		//console.log('Finding in User Collection', JSON.stringify({'$and':userQuery}));
		logger.info('Finding in User Collection---'+ JSON.stringify({'$and':userQuery}));
		User.find({'$and':userQuery},fetchFields,function(err, data) {
			if (err) {
			    //console.log("Error in finding User Collection---",err);
			    logger.error(new Error("Error in finding User Collection---"+err));
			    return callback(err);
			} else {
				var users = data;
				//console.log('Data Found in User Collection');
				logger.info('Data Found in User Collection');
				return callback(null,users);
			}
		});
	},function(callback){
		//console.log('Finding in Invitation Collection', JSON.stringify({'$and': inviteQuery}));
		logger.error(new Error('Finding in Invitation Collection---'+ JSON.stringify({'$and': inviteQuery})));
		Invite.find({'$and': inviteQuery},{},
        function(err, data) {
               if (err) {
                //console.log(err);
                logger.error(new Error('Error in Finding Invite Collection---'+err));
                return callback('Error in Finding Invite Collection---'+err);
            }  else {
            	//console.log('Data Found in Invitation Collection');
            	logger.info('Data Found in Invitation Collection');
                return callback(null,data);
            }
        });
    },function(callback){
				
		User.find({'email':email},{},
        function(err, data) {
               if (err) {
               	//console.log(err);
               	logger.error(new Error('Error in Finding Invite Collection---'+err));
                return callback('Error in Finding Invite Collection---'+err);
            }  else {
            	//console.log('Data Found in User Collection for logined user');
            	logger.info('Data Found in User Collection for logined user');
                return callback(null,data);
            }
        });
    }
    ],function(err, results){
    	if (err) {
                //console.log("alluserdata_api - Error in async calls--- ",err);
                logger.error(new Error("alluserdata_api - Error in async calls--- "+err));
                return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                    message: "Error api / getalluserdata."
                });
            }  else if(results){
            	var message = '';
            	//console.log('Result Counts:',results[0].length, results[1].length);
            	if(results[0].length || results[1].length){
            		//console.log("alluserdata_api - Search successfull api / getalluserdata--- ",results);
            	}else{
            		message = "This selection yields no result.";
            		//console.log("This selection yields no result.");
            	}

            	res.render('partials/manageaccountsgrid',
            	{
            		layout: false,
            		loggedInUser: results[2][0],
					gridData: {
						users: results[0],
						invites: results[1],
						
						message: message
					}
				});
          }
	});

});

module.exports = router;
