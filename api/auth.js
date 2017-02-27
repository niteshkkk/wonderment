var config = require('../config');
var UserModel = require('../models/user');
var User = UserModel.userModel;

var Utils = require('../utils/utils');
var validator = require('../validator/apiValidator');
var jwt = require('jsonwebtoken');
var SendGrid = require('sendgrid').SendGrid;
var sendgrid = new SendGrid(config.sending.user, config.sending.key);
var options = {'options': { 'replyto': 'no-reply@algolift.com' } };
var logger = require("../utils/logger").appLogger;
exports.register = function(req, res, done) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var phone = req.body.phone;
    var password = req.body.password;
    var email = req.body.email;
    var organization = req.body.organization;
    var role = '';
    var invitedby = {};
    var titles = [];
    
    if(req.body.invitedby){
        var invitedbyArray = req.body.invitedby.split(',');
        invitedby = {
            'firstName': invitedbyArray[0],
            'lastName': invitedbyArray[1],
            'email': invitedbyArray[2]
        };
        if(invitedbyArray[3]){
            if(invitedbyArray[3] === 'SuperAdmin'){
                role = 'Account Manager';
            }else{
                role = 'Team Member';
            }
        }
    }
        
    if(req.body.titles){
        var titleArray = req.body.titles.split(',');
       //console.log('titles array:---'+titleArray)
        logger.info('titles array:---'+titleArray);
        for(var i=0;i<titleArray.length;i++)
        {
            titles.push({'name':titleArray[i]});
        }
    }

    if(role === 'Account Manager'){
        var registerUser = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            email: email,
            role: role,
            organization: organization,
            titles: titles,
            status: 'Active',
            registrationDate: new Date(),
            canInvite: true,
            totalAllowedInvites: 10,
            totalInvited: 0,
            invitedBy: invitedby
        }
    }else{
        var registerUser = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            email: email,
            role: role,
            organization: organization,
            titles: titles,
            status: 'Active',
            registrationDate: new Date(),
            canInvite: false,
            invitedBy: invitedby
        }
    }

    //console.log("Into Register. User Info = " + JSON.stringify(registerUser));
    logger.info("Into Register. User Info = " + JSON.stringify(registerUser));
    User.register(new User(registerUser), password, function(err, user) {
        if (err) {
            //console.log("Into user registration. Err = " + err);
            logger.error(new Error("Into user registration. Err = " + err));
            return done(err);
        } else if (!user) {
            //console.log("Into user registration. Cannot create(insert into DB) user registration data.");
            logger.info("Into user registration. Cannot create(insert into DB) user registration data.");
            return done(null, false);
        } else {
            // console.log('Registration Completed.');
            // console.log('Sending Mail');
            logger.info('Registration Completed.');
            logger.info('Sending Mail');
            var from_email = email;
            var to_email = role === 'Account Manager' ? config.adminemail : invitedby.email;
            var subject = "New Registration";
            res.render('email/newregistration', {
                'url': config.site,
                'user': registerUser
            }, function(err, html) {
                if(err){
                    //console.log('Error in Sending Mail');
                    logger.error(new Error('Error in Sending Mail'));
                    return done(null, false, err);
                }
                Utils.sendMail(from_email, to_email, subject, html);
                //console.log('Mail sent successfully.');
                logger.info('Mail sent successfully.');
                var resp = {
                    status: true,
                    message: 'Thank you for completing your registration.'
                };
                return done(null, true, resp);
            });        
        }
    });
}
