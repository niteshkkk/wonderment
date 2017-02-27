var express = require('express');
var request = require('request');
var app = express();
var jwt = require('jsonwebtoken');
var config = require('../config');
var router = express.Router();
var dbConfig = require('../db');
var UserModel = require('../models/user');
var User = UserModel.userModel;


router.route('/').get(function(req, res, next) {
     var email= req.query.email;
     var password=req.query.password;

    
    User.update({email:email},{$set:{password:password}}, function(err, data) {
           if (err) {
           console.log("stp",err);
            return res.send(config.codes.INTERNAL_SERVER_ERROR, {});
            }  else 
                {
                     return res.send(config.codes.OK, {
                     data: data  
                     }); // end of res send
                }
    });
});

module.exports = router;
