var express = require('express');
var request = require('request');
var app = express();
var config = require('../config');
var router = express.Router();
var code = 200;
var dbConfig = require('../db');
var ReporttitleModel = require('../models/reporttitle');
var Reporttitle = ReporttitleModel.reporttitleModel;
 var logger = require("../utils/logger").appLogger;

router.route('/').get(function(req, res, next) {
var reporttitlename = req.query.reporttitlename;
var email = req.query.email;
var organization = req.query.organization;
var title = req.query.title;

var query={"reporttitlename":reporttitlename,"email":email,"organization":organization,"title":title};
Reporttitle.find(query,{},function(err, data) { 
                 if (err) {
                    //console.log("stp",err);
                    logger.error(new Error(err));
                    return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                 });
                  }else {
                  //console.log(data);
                  return res.send(200, {
                      data: data  
                      }); // end of res send
                  }
      });

 });

module.exports = router;
