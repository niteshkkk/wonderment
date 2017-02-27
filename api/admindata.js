var express = require('express');
var app = express();
var router = express.Router();
var config = require('../config');
var async = require("async");
var _ = require('underscore');

var UserModel = require('../models/user');
var User = UserModel.userModel;
var TitleModel = require('../models/title');
var Title = TitleModel.titleModel;
var ReporttitleModel = require('../models/reporttitle');
var Reporttitle = ReporttitleModel.reporttitleModel;
var OrganizationModel = require('../models/organization');
var Organization = OrganizationModel.organizationModel;
 var logger = require("../utils/logger").appLogger;


router.route('/').get(function(req, res, next) {
    //console.log('In getadmindata api');
    logger.info('In getadmindata api');
    if(req.headers.host == config.loaclapath){

    async.parallel([function(callback){
        User.findOne({'role':'SuperAdmin'},{},
          function(err, userData) {
            if (err) {
                //console.log(err);
                logger.error(new Error('Error in Get User By Email async call---'+err));
                return callback('Error in Get User By Email async call-----'+err);
            }else {
                return callback(null,userData);
            }
        });
    },function(callback){
        Title.find({},{},function(err, titles){
            if (err) {
                //console.log(err);
                logger.error(new Error('Error in Title async call-----'+err));
                return callback('Error in Title async call-----'+err);
            }  else {
                return callback(null,titles);
            }
        });
    },function(callback){
        Organization.find({},{},function(err, organizations){
            if (err) {
                //console.log(err);
                logger.error(new Error('Error in Organizationg async call-----'+err));
                return callback('Error in Organizationg async call-----'+err);
            }  else {
                return callback(null,organizations);
            }
        });
    },function(callback){
        Reporttitle.find({},{},function(err, reports){
            if (err) {
                //console.log(err);
                logger.error(new Error('Error in Reporttitle async call-----'+err));
                return callback('Error in Reporttitle async call-----'+err);
            }  else {
                return callback(null,reports);
            }
        });
    }],function(err, results){
           if (err) {
                //console.log("Error api / getAdminData--- ",err);
                logger.error(new Error("Error api / getAdminData--- ",err));
                res.status(config.codes.INTERNAL_SERVER_ERROR).send({
                    'message': "Error api / getAdminData."
                });
            }else {
                if(results){      
                    //console.log('Admin Data retrieved successfully!');
                    logger.info('Admin Data retrieved successfully!');
                    res.status(config.codes.OK).send({
                        'user': results[0],
                        'titles': results[1],
                        'organizations': results[2],
                        'reporttitles': results[3]
                    }); // end of res send
                }else{
                    logger.info('No data found for Admin');
                    res.status(config.codes.INTERNAL_SERVER_ERROR).send({
                        'user': '',
                        'titles': '',
                        'organizations': '',
                        'reporttitles': ''
                    }); // end of res send
                }
            }
    }); 
    }
    else{ 
    logger.info('Unautherized access');
                    res.status(config.codes.INTERNAL_SERVER_ERROR).send({
                        'user': '',
                        'titles': '',
                        'organizations': '',
                        'reporttitles': ''
                    });  
                }
 });


module.exports = router;
