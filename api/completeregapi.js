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

router.route('/').get(function(req, res, next) {
 
    var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNoZXRhbkB0ZXN0LmNvbSIsImlhdCI6MTQ2NjE3MDIzNiwiZXhwIjoxNDY2MTcwMjQ2fQ.XT5uT3JtDLEm162yUbbEOsz66VHfdp7TznynqMbVlKM";
    jwt.verify(token,config.hash,function(err,decode)
    {
      if(err){
        return err;
        console.log("inverify error" + err);
      }
      else{
              console.log("inverify " + decode.email);
              var email=decode.email;
              query={
                  'inviteToken':token
                    }
              User.find(query,fetchFields, function(err, data) {
                 if (err) {
                    console.log("stp",err);
                    return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                    });
                  } else {
                      console.log(data);
                      return res.send(200, {
                      data: data  
                      }); // end of res send
                    }
              });

              return res.send(config.codes.OK,{
                  status:true,
                  data:decode
              });
          }
        });



});

module.exports = router;
