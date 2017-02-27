var express = require('express');
var app = express();
var router = express.Router();
var config = require('../config');
var UserModel = require('../models/user');
var User = UserModel.userModel;

router.route('/:email').get(function(req, res, next) {
    var email = req.params.email;
    console.log('email-------'+email);
    var query = {'email':email};
    

    User.findOne(query,{},
      function(err, data) {
        if (err) {
          console.log("Error api / getactdetail--- ",err);
          return res.status(config.codes.INTERNAL_SERVER_ERROR).send({
            message:err
          });
        }  else {
          console.log('userprofile---' + data);
          return res.status(config.codes.OK).send({
            userAccDetail: data
          }); // end of res send
        }
      });
});

module.exports = router;
