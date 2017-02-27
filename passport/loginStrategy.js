var config = require('../config');
var UserModel = require('../models/user');
var User = UserModel.userModel;
var Utils = require('../utils/utils');
var LocalStrategy = require('passport-local').Strategy;
 var logger = require("../utils/logger").appLogger;


module.exports = function(passport){

	passport.serializeUser(function(user, done) {
	  done(null, user);
	});

	passport.deserializeUser(function(user, done) {
	  done(null, user);
    });

    passport.use('local',new LocalStrategy({
    	usernameField: 'email',
    	passwordField: 'password',
    	passReqToCallback: true
    },
    function(req, email,password, done){
    	//console.log("loginStrategy: Finding user=" + email);
        logger.info("loginStrategy: Finding user=" + email);
    	User.authenticate()(email, password, function(err, user){
    		if(err){ 
                //console.log(err);
                logger.error(new Error(err));
                return done(err);
            }
    		if(!user){
    			//console.log('No such user:' + email + 'exists.');
                logger.info('No such user:' + email + 'exists.');
    			return done(null, false, {
    				code: config.codes.UNAUTHORIZED,
    				message: 'User does not exist or password is invalid.'
    			});
    		}else if(user.status === "Inactive"){
                //console.log('User is not an active user', user.status);
                logger.info('User is not an active user', user.status);
                return done(null, false, {
                    code: config.codes.FORBIDDEN,
                    message: 'Your account seems to be inactive. Please contact site administrator.'
                });
            }

            var secret = config.hash;
    		var loginResp = {
    			token: Utils.generateToken(email, secret, config.expiresInSec),
                user: {
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    status: user.status
                }
            }

            return done(null, true, loginResp);
    	});
    }

    ));

}
