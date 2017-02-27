var express = require('express');
var router = express.Router();
var async = require("async");
var config = require('../config');
var Utils = require('../utils/utils');
var dbConfig = require('../db');
var _ = require('underscore');


var InvitationModel = require('../models/invitation');
var Invite = InvitationModel.invitationModel;
var UserModel = require('../models/user');
var User = UserModel.userModel;
var OrganizationModel = require('../models/organization');
var Organization = OrganizationModel.organizationModel;
var TitleModel = require('../models/title');
var Title = TitleModel.titleModel;
var logger = require("../utils/logger").appLogger;

router.route('/').post(function(req, res, next) {

  var emailto = req.body.email;
  var organization = req.body.organization;
  var invitationDate = new Date();
  var tokenExpiryDate = new Date(new Date().getTime()+(10*24*60*60*1000));
  var status="Invited";
  var role=req.cookies.utype;
  var titles = req.body.titles;
  var inviteToken= Utils.generateToken(emailto,config.hash,config.expiresInSecs);
  var showtitles='';
  for(var i=0;i<titles.length;i++)
  {
      showtitles=showtitles+'<li>'+titles[i]["name"]+'</li>';
  }

  Invite.findOne({'sendTo.email':emailto},{},
    function(err,invitee){
        if(err){
          logger.error(new Error("inviteaccman_api: Error occured in finding invite:-" + err));
            return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                "message": "inviteaccman_api: Error occured in finding invite:-" + err
            });
        }else if(invitee){
            //console.log('Invitation already sent');
            logger.info('Invitation already sent');
            return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                "message": "Invitation already sent!"
            });            
        }else if(!invitee){
          User.findOne({'email':req.cookies.authuser},{},
                function(err, data) {
                  if (err) {
                    logger.error(new Error("Error in Finding Account Detail in Invite Account----"+err));
                      //console.log("Error in Finding Account Detail in Invite Account----"+err);
                      return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                          message: "Error in Finding Account Detail in Invite Account---"+err
                      });
                  } else {
                      if(data.role === 'SuperAdmin'){
                        role = 'Account Manager';
                      }else{
                        role = 'Team Member';
                      }

                      var invitation = new Invite({
                        "sendTo" : {
                              "email" : emailto,
                              "organization" : organization,
                              "role" : role,
                              "titles" : titles
                          },
                        "sentBy" : {
                            "firstName" : data.firstName,
                            "lastName" : data.lastName,
                            "email": data.email
                          },
                          "invitationDate":invitationDate,
                          "inviteToken":inviteToken,
                          "tokenExpiryDate":tokenExpiryDate,
                          "status":status
                      });

                      async.parallel([
                        function(callback){
                            invitation.save(function(err, data) {
                             if (err) {
                               //console.log("Error in Saving Invite Data----"+err);
                               logger.error(new Error("Error in Saving Invite Data----"+err));
                                return callback("Error in Saving Invite Data----"+err);
                              }  else {

                                  //console.log("Sending Email");
                                   logger.info("Sending Email");
                                  var url=config.site;
                                  var from_email = config.adminemail;
                                  var to_email = emailto;
                                  var subject = "Invitation";
                                  res.render('email/invitation', {
                                      'role': role,
                                      'url': url,
                                      'token': inviteToken, 
                                      'organization': organization,
                                      'titles': titles
                                  }, function(err, html) {
                                      if(err){
                                          //console.log('Error in Sending Mail');
                                          logger.error(new Error('Error in Sending Mail'));
                                          return callback("Error in Sending mail.");
                                      }
                                      Utils.sendMail(from_email, to_email, subject, html);
                                      //console.log('Mail send successfully.');
                                      logger.info('Mail send successfully.');
                                      return callback(null, "An Invitation has been sent to:-" + emailto);
                                  });
                               }
                            }); // end Invite Save
                      },function(callback){
                            User.update({email:data.email},{$inc:{totalInvited : 1}}, function(err, data) {
                              if (err) {
                                logger.error(new Error("Invitation count not updated---" + err));
                                return callback(err);
                              } else{
                                logger.info("Invitation count updated");
                               return callback(null,"Invitation count updated");
                              }
                            });
                      },function(callback){
                            Organization.update({'name':organization},{$set:{name : organization}},{upsert: true}, function(err, data) {
                              if (err) {
                                 logger.error(new Error("Organization not Updated..." + err));
                                return callback(err);
                              } else{
                                 logger.info("Organization Updated.");
                               return callback(null,"Organization Updated.");
                              }
                            });
                      },function(callback){
                            var titleorg ={};
                            titleorg.organization = {};
                            titleorg.organization.name = organization;
                            titleorg.organization.titles = [];
                            Title.findOne({'organization.name':organization},{},function(err, titleData){
                                if(err){
                                  logger.error(new Error(err));
                                  return callback(err);
                                }else if(titleData){
                                  //console.log('titleData---',titleData);
                                  var titlenames = titleData.organization.titles;
                                  
                                  var diff = _.difference(_.pluck(titles, "name"), _.pluck(titlenames, "name"));
                                  var newtitles = [];
                                  for(i=0;i<diff.length;i++){
                                    newtitles.push({'name': diff[i]});
                                  }
                                  
                                  Title.update({'organization.name':organization},{$push:{'organization.titles' : {$each: newtitles}}},
                                    function(err, data) {
                                     if (err) {
                                       logger.error(new Error("Titles not Updated..." + err));
                                      return callback(err);
                                      } else{
                                        logger.info("Titles Updated.");
                                       return callback(null,"Titles Updated.");
                                      }
                                  });
                                }else{
                                  var newTitle = new Title({
                                      'organization':{
                                        'name': organization,
                                        'titles': titles
                                      }
                                  });
                                  
                                  newTitle.save(function(err, data) {
                                   if (err) {
                                     //console.log("Error in Saving New Title Data----"+err);
                                     logger.error(new Error("Error in Saving New Title Data---"+err));
                                      return callback("Error in Saving Invite Data----"+err);
                                    }  else {
                                      logger.info("Title Saved");
                                      return callback(null, "Title Saved");
                                    }
                                  });
                                }
                            });
                      }],function(err, results){
                            if(err){
                              logger.error(new Error("An Error as occured in Invitation parallel process:-" + err));
                                  return res.status(config.codes.INTERNAL_SERVER_ERROR).send({
                                  "message": "An Error as occured in Invitation parallel process:-" + err
                              });
                            }else{
                              //console.log('Results:', results);
                               logger.info("An Invitation has been sent to:-" + emailto);
                                  return res.status(config.codes.OK).send({
                                  "message": "An Invitation has been sent to:-" + emailto
                              });
                            }
                      }); // end async
                  }
              });
      }
  });

 }); //end router

module.exports = router;
