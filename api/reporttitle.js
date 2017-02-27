var express = require('express');
var request = require('request');
var config = require('../config');
var router = express.Router();
var ReporttitleModel = require('../models/reporttitle');
var Reporttitle = ReporttitleModel.reporttitleModel;
var logger = require("../utils/logger").appLogger;

router.route('/').get(function(req, res, next) {
  //console.log("INFO - IN Reporttitle api");
  var email = req.query.email;
  var organization = req.query.organization;
  var title = req.query.title;
  var reportid = req.query.reportid;
  var reporttitlename = req.query.reporttitlename;
  var role = req.query.for;
  var query = {"email":email,"organization":organization,"title":title};

  if(role){
    query = {"organization":organization,"title":title};
  }
  // if(reporttitlename){
  //   query.reporttitlename = reporttitlename;
  // }

  if(reportid){
    query.reportid = reportid;
  }

  //console.log("INFO - Fetching reports data from Reporttitle.");
  logger.info("INFO - Fetching reports data from Reporttitle.");

  Reporttitle.find(query,{}, {sort: {modifieddate: -1}},
    function(err, data) { 
          if (err) {
            //console.log("ERROR - in Reporttitle api",err);
            logger.error(new Error("ERROR - in Reporttitle api" + err));
            return res.status(config.codes.INTERNAL_SERVER_ERROR).send({"message": err});
          }else {
            //console.log("INFO - Fetching reports data COMPLETE.");
            logger.info("INFO - Fetching reports data COMPLETE.");
            res.status(config.codes.OK).send({"data" : data});
          }
    });

});

module.exports = router;
