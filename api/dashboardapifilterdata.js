var express = require('express');
var request = require('request');
var config = require('../config');
var router = express.Router();
var mysql = require('mysql');
//var dbConfig = require('../db');
var HTTPClient = require('httpclient');
var logger = require("../utils/logger").appLogger;
var _ = require('underscore');

//this function will return platform , source and country list in array.
router.route('/').get(function(req, res, next) {

  // console.log("---DaTe--ORG---", req.query.org);
  // console.log("---DaTe--GAME---", req.query.game);
  var date_min = req.query.mindate;
  var date_max = req.query.maxdate;
  var organization = req.query.org;
  var title = req.query.game;
  var page = req.query.for;
  
  var qry = "";

  // if(page && page == 'C'){
  //   if (date_min && date_max) {
  //     qry = "SELECT distinct Platform,Country,Source FROM UA_dashboard WHERE  PlayerCount > 0 AND Install_dt between '" + date_min + "' and '" + date_max + "'";
  //   } else {
  //     qry = "SELECT distinct Platform,Country,Source FROM UA_dashboard WHERE  PlayerCount > 0";
  //   }
  // }else{
    if (date_min && date_max) {
      qry = "SELECT distinct Platform,Country,Source FROM UI_data_dates WHERE  ProjectionDate between '" + date_min + "' and '" + date_max + "'";
    } else {
      qry = "SELECT distinct Platform,Country,Source FROM UI_data_dates ";
    }
  //}

  logger.info('INFO - dashboardapifilterdata - Getting Connection string for organization --' + organization + ' and title--' + title);
  logger.info(qry);
 
  var options = {
    hostname: 'localhost',
    path: '/',
    port: 3000,
    secure: false,
    method: 'GET',
    "content-type": 'application/json',
    headers: {
      "Authorization": "Bearer "
    }
  };


  var httpClient = new HTTPClient(options);
  var requrl = '/api/getdbconn?&organization=' + encodeURIComponent(organization) + '&title=' + encodeURIComponent(title);
  //console.log('Sending Request to--', requrl);
  logger.info('Sending Request to--' + requrl);
  httpClient.request(requrl,
    function(err, httpres, body) {
      if (err) {
        //console.log('ERROR - dashboardapifilterdata -- In httprequest getdbconn api--', err);
        logger.error(new Error('ERROR - dashboardapifilterdata -- In httprequest getdbconn api--' + err));
        res.status(config.codes.INTERNAL_SERVER_ERROR).send({
          'error': err
        });
      } else if (httpres.statusCode != config.codes.OK) {
        //console.log('ERROR - dashboardapifilterdata -- In httprequest getdbconn api--', httpres);
        logger.error(new Error('ERROR - dashboardapifilterdata -- In httprequest getdbconn api--' + httpres));
        res.status(config.codes.INTERNAL_SERVER_ERROR).send({
          'error': JSON.parse(body).error
        });
      } else if (body) {
        var apiResponse = JSON.parse(body);
        //console.log(apiResponse);
        var db = apiResponse.data;

        if (db && db.connectionstring && db.user && db.password && db.database) {
          var dbConfig = {};

          dbConfig.mysqlhost = db.connectionstring;
          dbConfig.mysqluser = db.user;
          dbConfig.mysqlpwd = db.password;
          dbConfig.mysqldb = db.database;

          //console.log(dbConfig);

          //console.log('INFO - Connecting to MySQL DB');
          logger.info('INFO - Connecting to MySQL DB');
          var con = mysql.createConnection({
            host: dbConfig.mysqlhost,
            user: dbConfig.mysqluser,
            password: dbConfig.mysqlpwd,
            database: dbConfig.mysqldb
          });

          con.connect(
            function(err) {
              if (err) {
                //console.log('ERROR - In Connecting MYSQL DB', err);
                logger.error(new Error('ERROR - In Connecting MYSQL DB' + err));
                res.status(config.codes.INTERNAL_SERVER_ERROR).send({
                  error: "DB Connection Error"
                });
              } else {
                // console.log('INFO - Connection established');
                // console.log('INFO - Fetching data from MySql database');
                logger.info('INFO - Connection established');
                logger.info('INFO - Fetching data from MySql database');
                con.query(qry,
                  function(err, result, fields) {
                    if (err) {
                      //console.log('ERROR - Fetching data from MySql database--', err);
                      logger.error(new Error('ERROR - Fetching data from MySql database--' + err));
                      res.status(config.codes.INTERNAL_SERVER_ERROR).send({
                        error: "DB Connection Error"
                      });
                    } else {
                      var filterData = {};
                      filterData.Platform = [];
                      filterData.Country = [];
                      filterData.Source = [];
                      
                      for (var i = 0; i < result.length; i++) {
                        if (isInArray(result[i].Platform, filterData.Platform) == false) {
                          filterData.Platform.push(result[i].Platform);
                        }

                        if (isInArray(result[i].Country, filterData.Country) == false) {
                          filterData.Country.push(result[i].Country);
                        }

                        if (isInArray(result[i].Source, filterData.Source) == false) {
                          filterData.Source.push(result[i].Source);
                        }
                      }

                      var country = [];
                      if(_.contains(filterData.Country, 'USA')){
                        country.push('USA');
                      }else if(_.contains(filterData.Country, 'United States of America')){
                        country.push('United States of America');
                      }
                      if(_.contains(filterData.Country, 'Canada')){
                        country.push('Canada');
                      }
                      if(_.contains(filterData.Country, 'Australia')){
                        country.push('Australia');
                      }
                      if(_.contains(filterData.Country, 'United Kingdom')){
                        country.push('United Kingdom');
                      }else if(_.contains(filterData.Country, 'United Kingdom of Great Britain and Northern Ireland')){
                        country.push('United Kingdom of Great Britain and Northern Ireland');
                      }else if(_.contains(filterData.Country, 'UK')){
                        country.push('UK');
                      }

                      filterData.Country = _.sortBy(filterData.Country,function (name) {
                          return name;
                      }); 

                      _.each(filterData.Country,function(name){
                        if(!_.contains(country, name)){
                          country.push(name);
                        }
                      });

                      filterData.Country = country;
                      //console.log(dashboradData.Platform);
                      //console.log('INFO - Data fetching COMPLETE from MySql database');
                      con.end();
                      logger.info('INFO - Connection Closed');
                      logger.info('INFO - Data fetching COMPLETE from MySql database');
                      res.status(config.codes.OK).send({
                        "resultsdata": filterData
                      });
                    }
                  });
              }
            });
        } else {
          //logger.info("No sql connection defined for " + title);
          logger.error(new Error("No sql connection defined for " + title));
          res.status(config.codes.NOTIMPLEMENTED).send({
            error: "No sql connection defined for " + title
          });
        }
      }
    });
 });

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

module.exports = router;

// Sample output
// {"resultsdata":{"Platform":["Platform 1","Platform 2","Platform 3"],"Country":["Country 1","Country 2","Country 3","Country 4","Country 5","Country 6","Country 7","Country 8","Country 9","Country 10","Country 11","Country 12","Country 13","Country 16","Country 17","Country 14","Country 18","Country 19","Country 73"],"Source":["Source 1","Source 2","Source 3","Source 4","Source 5","Source 6","Source 7","Source 8","Source 9","Source 10","Source 11","Source 12","Source 13","Source 14","Source 15","Source 16","Source 17","Source 20","Source 21","Source 22","Source 23","Source 24","Source 25","Source 26","Source 27","Source 28","Source 34"]}}
