var express = require('express');
var request = require('request');
var app = express();
var config = require('../config');
var router = express.Router();
var dbConfig = require('../db');
var UserModel = require('../models/user');
var User = UserModel.userModel;
var Utils = require('../utils/utils');
var jwt = require('jsonwebtoken');
var fetchFields='email organization';
var logger = require("../utils/logger").appLogger;


router.route('/').get(function(req, res, next) {
  var email = req.query.email;
  query={'email':email}  
  User.find(query,{}, function(err, data) {
                 if (err) {
                    //console.log("stp",err);
                    logger.error(new Error(err));
                    return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                    });
                  } else {
                      //console.log(data);
                      return res.send(200, {
                      data: data  
                      }); // end of res send
                    }
              });


});

module.exports = router;

















