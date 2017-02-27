var express = require('express');
var request = require('request');
var app = express();
var config = require('../config');
var router = express.Router();
var UserModel = require('../models/user');
var User = UserModel.userModel;
var InvitationModel = require('../models/invitation');
var Invite = InvitationModel.invitationModel;
var logger = require("../utils/logger").appLogger;


router.route('/').post(function(req, res, next) {
    var email= req.body.email;
    var name=req.body.name;
    var isInvite = req.body.isinvite;

    if(isInvite){
        Invite.update({'sendTo.email':email},{$pull:{'sendTo.titles' : {name : name}}}, 
            function(err, data) {
                if (err) {
                    //console.log("stp",err);
                    logger.error(new Error(err));
                    return res.send(config.codes.INTERNAL_SERVER_ERROR, {});
                } else {
                    return res.send(config.codes.OK, {
                        data: data  
                    }); // end of res send
                }
             });
    }else{
        User.update({email:email},{$pull:{titles : {name : name}}}, function(err, data) {
               if (err) {
                    //console.log("dltgame_api: Error deleting title from user document.",err);
                    logger.error(new Error("dltgame_api: Error deleting title from user document." + err));
                    return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                        'message': 'Error deleting title from user document.'
                    });
                } else {
                    return res.send(config.codes.OK, {
                        data: data  
                    }); // end of res send
                }
        });
    }
});

module.exports = router;
