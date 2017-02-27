var express = require('express');
var request = require('request');
var app = express();
var jwt = require('jsonwebtoken');
var config = require('../config');
var router = express.Router();
var code = 200;
var arraytwo=[];
var array=[];
var dbConfig = require('../db');
var UserModel = require('../models/user');
var User = UserModel.userModel;
  
  router.route('/').get(function(req, res, next) {
  var doc = req.body.doc;
  console.log(doc);
  var query={doc};

    User=new User(query);

    User.save(function(err, data) {
                       if (err) {
                       console.log("stp",err);
                        return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                       });

                        }  else {
                       
                        console.log(data);
                        return res.send(200, {
                            data: data  
                            }); // end of res send
                           }
                });

 });

module.exports = router;
