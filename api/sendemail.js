var express = require('express');
var router = express.Router();
var config = require('../config');
var Utils = require('../utils/utils');
var logger = require("../utils/logger").appLogger;

router.route('/').post(function(req, res, next) {
    
    var email = req.body.email;
    var name = req.body.name;
    var message = req.body.message;
    
    //console.log('sending email-------'+email); 
    logger.info('sending email-------' + email);
    Utils.sendMail(email, config.contactusemail, "Contact Us Query", message);
  	res.send(config.codes.OK, {message: 'Mail sent'});
}
);

module.exports = router;






