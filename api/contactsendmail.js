var express = require('express');
var app = express();
var router = express.Router();
var config = require('../config');
var Utils = require('../utils/utils');
var UserModel = require('../models/user');
var User = UserModel.userModel;
var logger = require("../utils/logger").appLogger;

            
router.route('/').post(function(req, res, next) {
 
  var fname = req.body.fname;
  var lname = req.body.lname;
  var contactemail = req.body.contactemail;
  var mobnumber = req.body.mobnumber;
  var comapnyname = req.body.comapnyname;
  var radio = req.body.radio;
  var textarea = req.body.textarea;
                  var from_email = contactemail;
                  var to_email = config.contactusemail;
                  var subject = "Contact Request From Website";

                  res.render('email/contactmail', {
                      'url': config.site,
                      'fname':fname,
                      'lname':lname,
                      'contactemail':contactemail,
                      'mobnumber':mobnumber,
                      'comapnyname':comapnyname,
                      'radio':radio,
                      'textarea':textarea,
                  }, function(err, html) {
                      if(err){
                          //console.log('Error in Sending Mail', err);
                          logger.error(new Error('Error in Sending Mail'+ err));
                          res.status(config.codes.INTERNAL_SERVER_ERROR).send({message: 'Error in Sending mail. Please try again in a while.'});
                      }
                      Utils.sendMail(from_email, to_email, subject, html);
                      //console.log('Mail send successfully.');
                      logger.info('Mail send successfully.');
                      res.status(config.codes.OK).send({message: 'Mail sent'});
                  });

 });

module.exports = router;
