var express = require('express');
var router = express.Router();
var config = require('../config');
var UserModel = require('../models/user');
var User = UserModel.userModel;
 var logger = require("../utils/logger").appLogger;


router.route('/').post(function(req, res, next) {
    var email= req.body.email;
    var status = req.body.status;

    // console.log("Status update for email---",email);
    // console.log("New Status to update---",status);
    User.update({email:email},{$set:{status : status}}, 
        function(err, data) {
            if (err) {
                //console.log("updatestatus_api: Error udpating user staus---",err);
                logger.error(new Error("updatestatus_api: Error udpating user staus---" + err));
                return res.status(config.codes.INTERNAL_SERVER_ERROR).send({});
            } else {       
                //console.log("updatestatus_api: User status updated successfully!");
                logger.info("updatestatus_api: User status updated successfully!");
                return res.status(config.codes.OK).send({'message': 'Status updated.', 'updated': true})
            }
        });
});

module.exports = router;