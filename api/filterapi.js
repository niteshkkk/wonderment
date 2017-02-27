var express = require('express');
var request = require('request');
var fs = require('fs');
var app = express();
var config = require('../config');
var router = express.Router();
var code = 200;
var dbConfig = require('../db');
var TitleModel = require('../models/title');
var Title = TitleModel.titleModel;
var RoleModel = require('../models/role');
var Role = RoleModel.roleModel;
var OrganizationModel = require('../models/organization');
var Organization = OrganizationModel.organizationModel;

router.route('/').get(function(req, res, next) {
    Title.find({},{},function(err, titlecollection) {
                       if (err) {
                       console.log("error",err);
                       return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                            
                        });
                        }  else {
                              console.log(titlecollection);
                              Role.find({},{},function(err, rolecollection) {
                                     if (err) {
                                     console.log("abhi1");
                                     return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                                          
                                      });

                                      }  else {
                                           console.log("abhi2");
                                           console.log(rolecollection);
                                           Organization.find({},{},function(err, organizationcollection) {
                                                 if (err) {
                                                 return res.send(config.codes.INTERNAL_SERVER_ERROR, {});
                                                 }  else {
                                                       console.log("abhi2");
                                                       console.log(organizationcollection);
                                                       return res.send(200, {
                                                       databasecollections: {organizationcollection,titlecollection,rolecollection} 
                                                       }); // end of res send
                                                    }
                                           });

                                      }
                              });

                           }
                });


 });

module.exports = router;
