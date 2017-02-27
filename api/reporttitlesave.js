var express = require('express');
var uuid = require('node-uuid');
var request = require('request');
var config = require('../config');
var router = express.Router();
var dbConfig = require('../db');
var ReporttitleModel = require('../models/reporttitle');
var Reporttitle = ReporttitleModel.reporttitleModel;
 var logger = require("../utils/logger").appLogger;

router.route('/').post(function(req, res, next) {
  var reporttitlename = req.body.reporttitlename;
  var cohortstartdate = req.body.cohortstartdate;
  var cohortenddate = req.body.cohortenddate;
  var platforms = req.body.platforms;
  var sources = req.body.sources;
  var country = req.body.country;
  var horizon = req.body.horizon;
  var email = req.body.email;
  var organization = req.body.organization;
  var title = req.body.title;
  var createddate = req.body.createddate;
  var modifieddate = req.body.modifieddate;
  var reportid = req.body.reportid;
  var isSave=req.body.isSave;
  var organiclift=req.body.organiclift;
  
  if(!reportid){
    reportid = uuid.v1();
    //console.log("Report id - \n"+reportid);
    logger.info("Report id - \n" + reportid);
  }

  var isExitsQuery={"reporttitlename":reporttitlename,"email":email,"organization":organization,"title":title};
  var saveQuery={"reporttitlename":reporttitlename,"cohortstartdate":cohortstartdate,"cohortenddate":cohortenddate,"platforms":platforms,"sources":sources,"country":country,"horizon":horizon,"organiclift":organiclift,"email":email,"organization":organization,"title":title,"createddate":createddate,"modifieddate":modifieddate};
  var idQuery={"reportid":reportid};

  if(isSave){
    //console.log("Save ------------------- \n")
    logger.info("Save ------------------- \n");
    //save case
    saveReportData();
  }else{
    //console.log("Save As ------------------- \n")
    logger.info("Save As------------------- \n");
    //saveAs case
        
  Reporttitle.find(isExitsQuery,function(err, data) {
                       if (err) {
                       //console.log("Error in Save query",err);
                       logger.error(new Error("Error in Save query" + err));
                        return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                       });

                        }  else {
                        
                        //check that report name exits 
                        if(data.length>0){
                         return res.send(config.codes.DUPLICATE, {});
                        }
                        saveReportData();                  
                      }
              });
  }

  function saveReportData()
  {
// var report_title=new Reporttitle(saveQuery);
//{username : username}, {$set : doc}, {upsert : true}
   Reporttitle.update(idQuery,{$set : saveQuery}, {upsert : true},function(err, data) {
                         if (err) {
                         //console.log("Error in Save query",err);
                          logger.error(new Error("Error in Save query" + err));
                          return res.send(config.codes.INTERNAL_SERVER_ERROR, {
                         });

                          }  else {
                         data.reportid =idQuery.reportid;
                          //console.log(data);
                          return res.send(config.codes.OK, {
                              data: data  
                              }); // end of res send
                             }
                  });
  }

 });

module.exports = router;

