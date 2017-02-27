var express = require('express');
var app = express();
var router = express.Router();
var config = require('../config');
var async = require("async");

var UserModel = require('../models/user');
var User = UserModel.userModel;
var InvitationModel = require('../models/invitation');
var Invite = InvitationModel.invitationModel;
var TitleModel = require('../models/title');
var Title = TitleModel.titleModel;
var RoleModel = require('../models/role');
var Role = RoleModel.roleModel;
var OrganizationModel = require('../models/organization');
var Organization = OrganizationModel.organizationModel;
 var logger = require("../utils/logger").appLogger;

router.route('/:email').get(function(req, res, next) {
    var role = req.cookies.utype;
    var email = req.params.email;
    var query = {};
    var fetchFields='firstName lastName role email registrationDate organization titles status';
    //console.log('In getaccmanagedata api with email---'+ email);
    logger.info('In getaccmanagedata api with email---'+ email);
    User.findOne({'email':email},{},
      function(err, userData) {
        if (err) {
            //console.log(err);
            logger.error(new Error(err));
            return callback('Error in Get Logged In Account Detail async call-----'+err);
        } 
        //console.log('Fetching Manage Account Screen Data for User --', userData);
        logger.info('Fetching Manage Account Screen Data for User --'+ userData);
        async.parallel([
            function(callback){
            if(userData.role === "SuperAdmin"){
                query = {'role': {$ne:userData.role}};
            }else{
                query = {'invitedBy.email': email};
            }
            // console.log('Query---', query);
            User.find(query,fetchFields, 
            function(err, data) {
               if (err) {
                   // console.log(err);  
                    logger.error(new Error('Error in Get User By Email async call-----'+err));          
                    return callback('Error in Get User By Email async call-----'+err);
                }  else {
                    return callback(null,data);
                }
            });
            },
            function(callback){
                var query = {};
                // if(userData.role != "SuperAdmin"){
                //     return callback(null, userData.titles)
                // }
                Title.find(query,{},function(err, data){
                    if (err) {
                        // console.log(err);
                         logger.error(new Error('Error in Title async call-----'+err));
                        return callback('Error in Title async call-----'+err);
                    }  else {
                        return callback(null,data);
                    }
                });
            },
            function(callback){
                // if(userData.role != "SuperAdmin"){
                //     return callback(null, userData.title)
                // }
                Role.find({},{},function(err, data){
                    if (err) {
                        //console.log(err);
                        logger.error(new Error('Error in Role async call-----'+err));
                        return callback('Error in Role async call-----'+err);
                    }  else {
                        return callback(null,data);
                    }
                });
            },
            function(callback){
                // if(userData.role != "SuperAdmin"){
                //     return callback(null, {name : userData.organization})
                // }
                Organization.find({},{},function(err, data){
                    if (err) {
                        //console.log(err);
                        logger.error(new Error('Error in Organization async call-----'+err));
                        return callback('Error in Organization async call-----'+err);
                    }  else {
                        return callback(null,data);
                    }
                });
            },
            function(callback){
                var invitequery = {};
                if(userData.role === "SuperAdmin"){
                    invitequery = {'status': 'Invited'};
                }else{
                    invitequery = {'status': 'Invited', 'sentBy.email': email};
                }
                // console.log('Invite Query---', invitequery);
                Invite.find(invitequery,{}, 
                    function(err, data) {
                           if (err) {
                            //console.log(err);
                            logger.error(new Error('Error in Get Invites By Email async call-----'+err));
                            return callback('Error in Get Invites By Email async call-----'+err);
                        }  else {
                            return callback(null,data);
                        }
                    });
            },
            function(callback){
                query = {'invitedBy.email': email};
                User.count(query,function(err, count) {
                   if (err) {
                        //console.log(err); 
                        logger.error(new Error('Error in Get User By Email async call-----'+err));           
                        return callback('Error in Get User By Email async call-----'+err);
                    }  else {
                        return callback(null,count);
                    }
                });
            }],
            function(err, results){
                if (err) {
                   // console.log("Error api / getaccmanagedata--- ",err);
                     logger.error(new Error("Error api / getaccmanagedata--- " + err));   
                    return res.status(config.codes.INTERNAL_SERVER_ERROR).send({
                        'message': "Error api / getaccmanagedata."
                    });
                }  else {
                    if(results){
                        // console.log('loggedInUser', JSON.stringify(results[0]));
                        // console.log('users', JSON.stringify(results[1]));
                        //console.log('titles------->>', JSON.stringify(results[1]));
                        // console.log('roles', JSON.stringify(results[3]));
                        // console.log('organizations', JSON.stringify(results[4]));
                        // console.log('invites', JSON.stringify(results[5]));
                        
                        //console.log('getaccmanagedata_api--- Data Retrived Successfully for Page');
                         logger.info('getaccmanagedata_api--- Data Retrived Successfully for Page');
                        return res.status(config.codes.OK).send({
                            loggedInUser: userData,
                            users: results[0],
                            titles: results[1],
                            roles: results[2],
                            organizations: results[3],
                            invites: results[4],
                            total: results[5]
                        }); // end of res send
                    }else{
                        logger.error(new Error("Error api / getaccmanagedata--- No data found."));   
                        return res.status(config.codes.INTERNAL_SERVER_ERROR).send({
                            loggedInUser: {},
                            users: {},
                            invites: {},
                            titles: {},
                            roles: {},
                            organizations: {},
                            total: {}
                        }); // end of res send
                    }
                }
            });
    });
});

module.exports = router;
