var express = require('express');
var request = require('request');
var app = express();
var jwt = require('jsonwebtoken');
var config = require('../config');
var router = express.Router();
var code = 200;
var arraytwo = [];
var array = [];
var dbConfig = require('../db');
var UserModel = require('../models/user');
var User = UserModel.userModel;
var logger = require("../utils/logger").appLogger;

router.route('/').get(function(req, res, next) {
  //console.log('INFO - In usertitle api');
  logger.info('INFO - In usertitle api');
  var email = req.query.email;
  //console.log('INFO - Fetching user title details for email --', email);
  logger.info('INFO - Fetching user title details for email --' + email);
  User.findOne({
      "email": email
    }, {
      _id: 0,
      titles: 1,
      email: 1,
      organization: 1,
      firstName: 1,
      role: 1
    },
    function(err, data) {
      if (err) {
        //console.log("ERROR - In usertitle api", err);
        logger.error(new Error("ERROR - In usertitle api" + err));
        res.status(config.codes.INTERNAL_SERVER_ERROR).send({
          "error": err
        });
      } else {
        //console.log(data);
        //console.log('INFO - Fetching user title details COMPLETE.');
        logger.info('INFO - Fetching user title details COMPLETE.');
        res.status(config.codes.OK).send({
          data: data
        }); // end of res send
      }
    });

});

module.exports = router;
