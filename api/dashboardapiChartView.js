var express = require('express');
var request = require('request');
var config = require('../config');
var router = express.Router();
var format = require('string-format');
var mysql = require('mysql');
var dbConfig = require('../db');
//var dbConfig = require('../db');
var HTTPClient = require('httpclient');
 var logger = require("../utils/logger").appLogger;
   
   

//this function will return platform , source and country list in array.
router.route('/').get(function(req, res, next) {
var query4Chart= "";
if(Object.keys(req.query).length === 0)
{

    query4Chart = GetRawSqlQuery4DefaultChart();
}
else{
    var startdate = "";
    var enddate = "";
    var platform = "";
    var sources = "";
    var country = "";
    var organiclift = "";
    var horizon = "";
    var organization = '';
    var title = '';
if(Object.keys(req.query).length === 2)
{

     startdate = req.query.mindate;
     enddate = req.query.maxdate;
     platform = "['All']";
     sources = "['All']";
     country = "['All']";
 }
 else
 {
    startdate = req.query.mindate;
     enddate = req.query.maxdate;
     platform = req.query.platform;
 
 sources = req.query.sources;
     country = req.query.country;
     organiclift = req.query.organiclift;
     horizon = req.query.horizon;
     organization = req.query.org;
     title = req.query.game;
 }
 query4Chart= SelectScenario4Chart(platform, sources, startdate, enddate, country, organiclift, horizon);

}


    //console.log('INFO - Getting Connection string for organization --'+ organization + ' and title--' + title);
    logger.info('INFO - Getting Connection string for organization --'+ organization + ' and title--' + title);

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
    var dbConfig = {};
    var httpClient = new HTTPClient(options);
    var requrl = '/api/getdbconn?&organization=' + encodeURIComponent(organization) + '&title=' + encodeURIComponent(title);
    //console.log('Sending Request to--', requrl);
    logger.info('Sending Request to--' + requrl);
    httpClient.request(requrl,
        function(err, httpres, body) {
            if (err) {
                //console.log('ERROR - dashboardapiChartView -- In httprequest getdbconn api--', err);
                logger.error(new Error('ERROR - dashboardapiChartView -- In httprequest getdbconn api--' + err));
                res.status(config.codes.INTERNAL_SERVER_ERROR).send({'error': err});
            } else if (httpres.statusCode != config.codes.OK) {
                logger.error(new Error('ERROR - dashboardapiChartView -- In httprequest getdbconn api--' + httpres));
                //console.log('ERROR - dashboardapiChartView -- In httprequest getdbconn api--', httpres);
                res.status(config.codes.INTERNAL_SERVER_ERROR).send({'error': JSON.parse(body).error});
            } else if (body) {
                var apiResponse = JSON.parse(body);
                //console.log(apiResponse);
                if(apiResponse && apiResponse.data.connectionstring && apiResponse.data.user && apiResponse.data.password && apiResponse.data.database){
                    dbConfig.mysqlhost = apiResponse.data.connectionstring;
                    dbConfig.mysqluser = apiResponse.data.user;
                    dbConfig.mysqlpwd = apiResponse.data.password;
                    dbConfig.mysqldb = apiResponse.data.database;

                    //console.log(dbConfig);
                    logger.info('INFO - Connecting to MySQL DB');

                    //console.log('INFO - Connecting to MySQL DB');
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
                                res.status(config.codes.INTERNAL_SERVER_ERROR).send({error: "DB Connection Error"});
                            }else{
                                // console.log('INFO - Connection established');
                                // console.log('INFO - Fetching data from MySql database');
                                logger.info('INFO - Connection established');
                                logger.info('INFO - Fetching data from MySql database');
                                logger.info('INFO - DASHBOARD - Get Chart Data');
                                con.query(query4Chart, function(err, dbResult, fields) {
                                    if (err) {
                                        //console.log('ERROR - Fetching data from MySql database--', err);
                                        logger.error(new Error('ERROR - Fetching data from MySql database--' + err));
                                        res.status(config.codes.INTERNAL_SERVER_ERROR).send({error: "DB Connection Error"});
                                    } else {
                                        con.end();
                                        logger.info('INFO - DASHBOARD - Get Chart Data COMPLETE');
                                        logger.info('INFO - Connection Closed');
                                        //console.log('Connection Closed');
                                        //console.log(dbResult);
                                        //console.log('INFO - Data fetching COMPLETE from MySql database');
                                        logger.info('INFO - Data fetching COMPLETE from MySql database');
                                        res.status(config.codes.OK).send({
                                            "chartresultsvalues": dbResult
                                        });
                                    }
                                    query4Chart = "";
                                });
                            }
                        }
                    );
                }else{
                    logger.error(new Error("No sql connection defined for " + title));
                    res.status(config.codes.NOTIMPLEMENTED).send({error: "No sql connection defined for " + title});
                }                
            }
        });    
});

//------------------ START OF CHART BINDING SCENARIOS------------

function SelectScenario4Chart(platform, sources, startdate, enddate, country, organiclift, horizon) {

   // process.stdout.write('\033c');

    var query = "";
    if (platform.indexOf("All") == -1 && sources.indexOf("All") == -1) {
        query = MultiPlatformMultiSource4Chart(platform, sources, startdate, enddate, country, organiclift, horizon);
    } else if (platform.indexOf("All") > -1 && sources.indexOf("All") == -1) {
        query = AllPlatformMultiSource4Chart(platform, sources, startdate, enddate, country, organiclift, horizon);
    } else if (platform.indexOf("All") == -1 && sources.indexOf("All") > -1) {
        query = MultiPlatformAllSource4Chart(platform, sources, startdate, enddate, country, organiclift, horizon);
    } else if (platform.indexOf("All") > 0 && sources.indexOf("All") > 0) {
        query = AllPlatformAllSource4Chart(platform, sources, startdate, enddate, country, organiclift, horizon);
    }
    return query;
}

//----- Scenario 1
function MultiPlatformMultiSource4Chart(platform, sources, startdate, enddate, country, organiclift, horizon) {
 var sqlQuery = "";

  var groupbyclause = "";
    var orderbyclause = "";
    var platform_part = "";
    var source_part = "";
    var country_part = "";
    var horizon_part = "";
    //console.log("MultiPlatformMultiSource");

    var coutryqueryclause = GetCountryClause4Chart(country);

    groupbyclause = coutryqueryclause.groupbyclause;
    orderbyclause = coutryqueryclause.orderbyclause;
    country_part = coutryqueryclause.country_part;

    var platformstring = JSON.parse(platform).join("','");

    platformstring = "'" + platformstring + "'";

    platform_part = format("AND platform IN ({0}) ", platformstring);

    var sourcestring = JSON.parse(sources).join("','");
    sourcestring = "'" + sourcestring + "'";
    source_part = format("AND source in  ({0}) ", sourcestring);

    // console.log(country_part);
    // console.log(source_part);

    sqlQuery = GetRawSqlQuery4Chart(platform_part, source_part, startdate, enddate, country_part, organiclift, horizon, groupbyclause, orderbyclause);

    return sqlQuery;

}

//----- Scenario 2
function AllPlatformMultiSource4Chart(platform, sources, startdate, enddate, country, organiclift, horizon) {
 var sqlQuery = "";
    //console.log("AllPlatformMultiSource");
 var groupbyclause = "";
    var orderbyclause = "";
    var platform_part = "";
    var source_part = "";
    var country_part = "";
    var horizon_part = "";
    var coutryqueryclause = GetCountryClause4Chart(country);

    groupbyclause = coutryqueryclause.groupbyclause;
    orderbyclause = coutryqueryclause.orderbyclause;
    country_part = coutryqueryclause.country_part;

    var sourcestring = JSON.parse(sources).join("','");
    sourcestring = "'" + sourcestring + "'";
    source_part = format("AND source in  ({0}) ", sourcestring);

    

    sqlQuery = GetRawSqlQuery4Chart(platform_part, source_part, startdate, enddate, country_part, organiclift, horizon, groupbyclause, orderbyclause);

    return sqlQuery;
}

//----- Scenario 3
function MultiPlatformAllSource4Chart(platform, sources, startdate, enddate, country, organiclift, horizon) {
 var sqlQuery = "";
  var groupbyclause = "";
    var orderbyclause = "";
    var platform_part = "";
    var source_part = "";
    var country_part = "";
    var horizon_part = "";
    //console.log("MultiPlatformAllSource");

    var coutryqueryclause = GetCountryClause4Chart(country);

    groupbyclause = coutryqueryclause.groupbyclause;
    orderbyclause = coutryqueryclause.orderbyclause;
    country_part = coutryqueryclause.country_part;

    var platformstring = JSON.parse(platform).join("','");

    platformstring = "'" + platformstring + "'";

    platform_part = format("AND platform IN ({0}) ", platformstring);

    // console.log(country_part);
    // console.log(source_part);

    sqlQuery = GetRawSqlQuery4Chart(platform_part, source_part, startdate, enddate, country_part, organiclift, horizon, groupbyclause, orderbyclause);

    return sqlQuery;
}

//----- Scenario 4
function AllPlatformAllSource4Chart(platform, sources, startdate, enddate, country, organiclift, horizon) {
     var sqlQuery = "";
      var groupbyclause = "";
    var platform_part = "";
    var source_part = "";
    var country_part = "";
    var horizon_part = "";
    var orderbyclause = "";
    //console.log("AllPlatformAllSource");

    var coutryqueryclause = GetCountryClause4Chart(country);

    groupbyclause = coutryqueryclause.groupbyclause;
    orderbyclause = coutryqueryclause.orderbyclause;
    country_part = coutryqueryclause.country_part;
    sqlQuery = GetRawSqlQuery4Chart(platform_part, source_part, startdate, enddate, country_part, organiclift, horizon, groupbyclause, orderbyclause);

    return sqlQuery;
}

function GetCountryClause4Chart(country) {
    var sqlQuery = "";
    var countryqueryclause = {};
    countryqueryclause.groupbyclause = "";
    countryqueryclause.orderbyclause = "";
    countryqueryclause.country_part = "";

    if (country.indexOf("All") > -1) {      
        countryqueryclause.orderbyclause = "ORDER BY  source";
    } else {        
        countryqueryclause.country_part = format("AND country in  ({0}) ", country);
    }
    
    countryqueryclause.groupbyclause = "GROUP BY  source ";
    countryqueryclause.orderbyclause = "ORDER BY  source";

    return countryqueryclause;
}

function GetRawSqlQuery4Chart(platform, sources, startdate, enddate, country, organiclift, horizon, groupbyclause, orderbyclause) {
    logger.info('GetRawSqlQuery4Chart');
    var selectquery = "SELECT " +
        "source, " +
        "ROUND(SUM(ProjectedARPI*PlayerCount) / SUM(PlayerCount),2) AS ProjectedARPI, " +
        "ROUND(SUM(ProjectedARPIOrganicMed*PlayerCount) / SUM(PlayerCount), 2) AS ProjectedARPIOrganicMed, " +
        "SUM(PlayerCount) AS PlayerCount, " +
        "SUM(PayerCount) AS PayerCount, " +
        "CASE WHEN( SUM(PlayerCount) > 500 AND SUM(PayerCount) > 10) THEN TRUE ELSE FALSE END AS isSignificant " +
        "FROM UA_dashboard " +
        "WHERE PlayerCount > 0 AND " +
        "Install_dt BETWEEN '" + startdate + "' AND '" + enddate + "' ";

    var horizon_part = "";
    if (horizon) {
        horizon_part = format("AND window = {0} ", horizon);
    }

    var RawSqlQuery = format(selectquery + "{0}{1}{2} {3} {4} {5} ",
        platform,
        sources,
        country,
        horizon_part,
        groupbyclause,
        orderbyclause
    )
    //console.log(RawSqlQuery);
    logger.info(RawSqlQuery);
    return RawSqlQuery;
}



function GetRawSqlQuery4DefaultChart() {
    logger.info('GetRawSqlQuery4DefaultChart');
    var selectquery =   "SELECT " +
                        "source, " +
                        "ROUND(SUM(ProjectedARPI*PlayerCount) / SUM(PlayerCount),2) AS ProjectedARPI, " +
                        "ROUND(SUM(ProjectedARPIOrganicMed*PlayerCount) / SUM(PlayerCount), 2) AS ProjectedARPIOrganicMed, " +
                        "SUM(PlayerCount) AS PlayerCount, " +
                        "SUM(PayerCount) AS PayerCount, " +
                        "CASE WHEN( SUM(PlayerCount) > 500 AND SUM(PayerCount) > 10) THEN TRUE ELSE FALSE END AS isSignificant " +
                        "FROM UA_dashboard " +
                        "WHERE PlayerCount > 0 " +
                        "GROUP BY  source " +
                        "ORDER BY  source";

    //console.log(selectquery);
    logger.info(selectquery);
    return selectquery;
}
module.exports = router;