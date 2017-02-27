var express = require('express');
var request = require('request');
var config = require('../config');
var router = express.Router();
var _ = require('underscore');

var TitleModel = require('../models/title');
var Title = TitleModel.titleModel;
var logger = require("../utils/logger").appLogger;
  
router.route('/').get(function(req, res, next) {
  var organization = req.query.organization;
  var title = req.query.title;
  // console.log(organization);
  // console.log(title);
  var query = {
    "organization.name" : organization
  };
  if(req.headers.host == config.loaclapath)
  {
  Title.find(query,{},function(err, titles) { 
                      if (err) {
                        //console.log("getdbconn api -- Error in getting titles by organization",err);
                        logger.error(new Error("getdbconn api -- Error in getting titles by organization",err));
                        
                        return res.status(config.codes.INTERNAL_SERVER_ERROR).send({
                          "error": err
                        });
                      }else {
                          //console.log(titles);
                          var titledata = _.findWhere(_.pluck(_.pluck(titles, 'organization'), 'titles')[0], {name: title});
                          res.status(config.codes.OK).send({"data" : titledata});
                      }
                });
}

else
{
  logger.info('Unautherized access');
  return res.status(config.codes.INTERNAL_SERVER_ERROR).send({
                          "error": "Unautherized access"
                        });

}

});

module.exports = router;
