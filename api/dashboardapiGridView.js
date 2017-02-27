var express = require('express');
var request = require('request');
var config = require('../config');
var router = express.Router();
var format = require('string-format');
var mysql = require('mysql');
//var dbConfig = require('../db');
var HTTPClient = require('httpclient');
var logger = require("../utils/logger").appLogger;

   
   

//this function will return platform , source and country list in array.
router.route('/').get(function(req, res, next) {
//console.log("----GriD--ORG--------", req.query.org);
//console.log("---GriD--GAME---------", req.query.game);

    var query = "";

    if(Object.keys(req.query).length === 0)
    {
        query = GetRawSqlQuery4Default(pageindex, pagesize);
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
        var title = '', pageindex = config.pageIndex_default, pagesize = config.pageSize_default,
            isPageLoad = true, forexport = false;

        if(Object.keys(req.query).length === 4)
        {
             startdate = req.query.mindate;
             enddate = req.query.maxdate;
             platform = "['All']";
             sources = "['All']";
             country = "['All']";
             pageindex = req.query.pageindex;
              pagesize = req.query.pagesize;
              isPageLoad = true;
             
         }
         else{
            startdate = req.query.mindate;
             enddate = req.query.maxdate;
             platform = req.query.platform;
             sources = req.query.sources;
             country = req.query.country;
             organiclift = req.query.organiclift;
             horizon = req.query.horizon;
             organization = req.query.org;
             title = req.query.game;
             pageindex = req.query.pageindex;
      pagesize = req.query.pagesize;
      isPageLoad = (req.query.isPageLoad === 'true');
      if(req.query.forexport){ forexport = true; isPageLoad = false;}
         }

         query = SelectScenario(platform, sources, startdate, enddate, country, organiclift, horizon, pageindex, pagesize, isPageLoad, forexport);

    }


    // console.log('INFO - Getting Connection string for organization --'+ organization + ' and title--' + title);
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
    logger.info('Sending Request to--', requrl);
    httpClient.request(requrl,
        function(err, httpres, body) {
            if (err) {
                //console.log('ERROR - dashboardapiGridView -- In httprequest getdbconn api--', err);
                logger.error(new Error('ERROR - dashboardapiGridView -- In httprequest getdbconn api--' + err));
                res.status(config.codes.INTERNAL_SERVER_ERROR).send({'error': err});
            } else if (httpres.statusCode != config.codes.OK) {
                //console.log('ERROR - dashboardapiGridView -- In httprequest getdbconn api--', httpres);
                logger.error(new Error('ERROR - dashboardapiGridView -- In httprequest getdbconn api--' + httpres));
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
                                res.status(config.codes.INTERNAL_SERVER_ERROR).send({error: "DB Connection Error"});
                            }else{
                                // console.log('INFO - Connection established');
                                // console.log('INFO - Fetching data from MySql database');
                                logger.info('INFO - Connection established');
                                logger.info('INFO - Fetching data from MySql database');
                                logger.info('INFO - DASHBOARD - Get GRID Data');
                                con.query(query, function(err, dbResult, fields) {
                                    if (err) {
                                        //console.log('ERROR - Fetching data from MySql database--', err);
                                        logger.error(new Error('ERROR - Fetching data from MySql database--' + err));
                                        res.status(config.codes.INTERNAL_SERVER_ERROR).send({error: "DB Connection Error"});
                                    } else {
                                        //console.log(dbResult);
                                        //console.log('INFO - Data fetching COMPLETE from MySql database');
                                       // con.end();
                                        logger.info('INFO - DASHBOARD - Get GRID Data COMPLETE');
                                        logger.info('INFO - Connection Closed');
                                        logger.info('INFO - Data fetching COMPLETE from MySql database');

                                        if(isPageLoad){

                                        con.query("select FOUND_ROWS() as count", function(err, totalResult){
                                            if(err)
                                            {

                                            }
                                            else{
                                                var t = totalResult[0];
//console.log("------------------------------", totalResult[0].count);
                                                //con.end();
                                            res.status(config.codes.OK).send({
                                            "resultsvalues": dbResult,
                                            "totalresult" : totalResult[0].count
                                            
                                        });
                                        }

                                        });
                                }
                                else
                                {
                                    //con.end();
                                    res.status(config.codes.OK).send({
                                            "resultsvalues": dbResult,
                                            
                                        });

                                }
                                       
                                    }
                                    query = "";
                                });
                            }
                        }
                    );                    
                }else{
                    //logger.info("No sql connection defined for " + title);
                    logger.error(new Error("No sql connection defined for " + title));
                    res.status(config.codes.NOTIMPLEMENTED).send({error: "No sql connection defined for " + title});
                }
            }
        });    
});




function SelectScenario(platform, sources, startdate, enddate, country, organiclift, horizon, pageindex, pagesize, isPageLoad, forexport) {

   // process.stdout.write('\033c');

    var query = "";
    if (platform.indexOf("All") == -1 && sources.indexOf("All") == -1) {
        query = MultiPlatformMultiSource(platform, sources, startdate, enddate, country, organiclift, horizon, pageindex, pagesize, isPageLoad, forexport);
    } else if (platform.indexOf("All") > -1 && sources.indexOf("All") == -1) {
        query = AllPlatformMultiSource(platform, sources, startdate, enddate, country, organiclift, horizon, pageindex, pagesize, isPageLoad, forexport);
    } else if (platform.indexOf("All") == -1 && sources.indexOf("All") > -1) {
        query = MultiPlatformAllSource(platform, sources, startdate, enddate, country, organiclift, horizon, pageindex, pagesize, isPageLoad, forexport);
    } else if (platform.indexOf("All") > 0 && sources.indexOf("All") > 0) {
        query = AllPlatformAllSource(platform, sources, startdate, enddate, country, organiclift, horizon, pageindex, pagesize, isPageLoad, forexport);
    }
    return query;
}

//----- Scenario 1
function MultiPlatformMultiSource(platform, sources, startdate, enddate, country, organiclift, horizon, pageindex, pagesize, isPageLoad, forexport) {
 var sqlQuery = "";

  var groupbyclause = "";
    var orderbyclause = "";
    var platform_part = "";
    var source_part = "";
    var country_part = "";
    var horizon_part = "";
    logger.info("dashboardGridView -- MultiPlatformMultiSource");

    var coutryqueryclause = GetCountryClause(country);

    groupbyclause = coutryqueryclause.groupbyclause;
    orderbyclause = coutryqueryclause.orderbyclause;
    country_part = coutryqueryclause.country_part;

    var platformstring = JSON.parse(platform).join("','");

    platformstring = "'" + platformstring + "'";

    platform_part = format("AND platform IN ({0}) ", platformstring);

    var sourcestring = JSON.parse(sources).join("','");
    
    sourcestring = "'" + sourcestring + "'";
    source_part = format("AND source in  ({0}) ", sourcestring);

    sqlQuery = GetRawSqlQuery(platform_part, source_part, startdate, enddate, country_part, organiclift, horizon, groupbyclause, orderbyclause, pageindex, pagesize, isPageLoad, forexport);

    return sqlQuery;

}

//----- Scenario 2
function AllPlatformMultiSource(platform, sources, startdate, enddate, country, organiclift, horizon, pageindex, pagesize, isPageLoad, forexport) {
 var sqlQuery = "";
    logger.info("dashboardapiGridView -- AllPlatformMultiSource");
 var groupbyclause = "";
    var orderbyclause = "";
    var platform_part = "";
    var source_part = "";
    var country_part = "";
    var horizon_part = "";
    var coutryqueryclause = GetCountryClause(country);

    groupbyclause = coutryqueryclause.groupbyclause;
    orderbyclause = coutryqueryclause.orderbyclause;
    country_part = coutryqueryclause.country_part;

    var sourcestring = JSON.parse(sources).join("','");
    sourcestring = "'" + sourcestring + "'";
    source_part = format("AND source in  ({0}) ", sourcestring);

    

    sqlQuery = GetRawSqlQuery(platform_part, source_part, startdate, enddate, country_part, organiclift, horizon, groupbyclause, orderbyclause, pageindex, pagesize, isPageLoad, forexport);

    return sqlQuery;
}

//----- Scenario 3
function MultiPlatformAllSource(platform, sources, startdate, enddate, country, organiclift, horizon, pageindex, pagesize, isPageLoad, forexport) {
 var sqlQuery = "";
  var groupbyclause = "";
    var orderbyclause = "";
    var platform_part = "";
    var source_part = "";
    var country_part = "";
    var horizon_part = "";
    logger.info("dashboardapiGridView -- MultiPlatformAllSource");

    var coutryqueryclause = GetCountryClause(country);

    groupbyclause = coutryqueryclause.groupbyclause;
    orderbyclause = coutryqueryclause.orderbyclause;
    country_part = coutryqueryclause.country_part;

    var platformstring = JSON.parse(platform).join("','");

    platformstring = "'" + platformstring + "'";

    platform_part = format("AND platform IN ({0}) ", platformstring);

    sqlQuery = GetRawSqlQuery(platform_part, source_part, startdate, enddate, country_part, organiclift, horizon, groupbyclause, orderbyclause, pageindex, pagesize, isPageLoad, forexport);

    return sqlQuery;
}

//----- Scenario 4
function AllPlatformAllSource(platform, sources, startdate, enddate, country, organiclift, horizon, pageindex, pagesize, isPageLoad, forexport) {
     var sqlQuery = "";
      var groupbyclause = "";
    var orderbyclause = "";
    var platform_part = "";
    var source_part = "";
    var country_part = "";
    var horizon_part = "";
    logger.info("dashboardapiGridView -- AllPlatformAllSource");

    var coutryqueryclause = GetCountryClause(country);

    groupbyclause = coutryqueryclause.groupbyclause;
    orderbyclause = coutryqueryclause.orderbyclause;
    country_part = coutryqueryclause.country_part;

if(country.indexOf("All") > -1)
{
    groupbyclause = "GROUP BY Platform,country,source,Install_dt"
}

    sqlQuery = GetRawSqlQuery(platform_part, source_part, startdate, enddate, country_part, organiclift, horizon, groupbyclause, orderbyclause, pageindex, pagesize, isPageLoad, forexport);

    return sqlQuery;
}

function GetCountryClause(country) {
     var sqlQuery = "";
    var countryqueryclause = {};
    countryqueryclause.groupbyclause = "";
    countryqueryclause.orderbyclause = "";
    countryqueryclause.country_part = "";

    if (country.indexOf("All") > -1) {
        countryqueryclause.groupbyclause = "GROUP BY  Install_dt, Platform,country, source ";
        countryqueryclause.orderbyclause = "ORDER BY  Platform, source, Install_dt";
    } else {
        countryqueryclause.country_part = format("AND country in  ({0}) ", country);
        countryqueryclause.groupbyclause = "GROUP BY  Install_dt, Platform, country, source ";
        countryqueryclause.orderbyclause = "ORDER BY  Platform, country, source, Install_dt";
    }

    return countryqueryclause;
}

function GetRawSqlQuery(platform, sources, startdate, enddate, country, organiclift, horizon, groupbyclause, orderbyclause, pageindex, pagesize, isPageLoad, forexport) {
   var selectquery = "";
     if(isPageLoad)
    {
       selectquery =  "SELECT SQL_CALC_FOUND_ROWS "
    }
    else
    {
        selectquery = "SELECT ";
    }
      
    selectquery += "DATE(Install_dt) as Cohort_Date, " +
        "Platform, " +
        "country, " +
        "source, " +
        "window, " +
        "ROUND(SUM(ProjectedARPI*PlayerCount) / SUM(PlayerCount), 2) AS ProjectedARPI, " +
        "ROUND(SUM(ProjectedARPIOrganicMed*PlayerCount) / SUM(PlayerCount), 2) AS ProjectedARPIOrganicMed, " +
        "SUM(PlayerCount) AS PlayerCount, " +
        "SUM(PayerCount) AS PayerCount, " +
        "CASE WHEN( SUM(PlayerCount) > 500 AND SUM(PayerCount) > 10) THEN TRUE ELSE FALSE END AS isSignificant " +
        "FROM UA_dashboard " +
        "WHERE PlayerCount > 0 AND " +
        "Install_dt BETWEEN '" + startdate + "' AND '" + enddate + "' ";

var limit = (!forexport)? "LIMIT "+(parseInt(pageindex) -1) * 10+", "+pagesize +";" : "";
    var horizon_part = "";
    if (horizon) {
        horizon_part = format("AND window = {0} ", horizon);
    }

    var RawSqlQuery = format(selectquery + "{0}{1}{2} {3} {4} {5} {6}",
        platform,
        sources,
        country,
        horizon_part,
        groupbyclause,
        orderbyclause,
        limit
    )
    logger.info(RawSqlQuery);
    return RawSqlQuery;
}

function GetRawSqlQuery4Default() {
    var selectquery = "SELECT " +
        "DATE(Install_dt) as Cohort_Date, " +
        "Platform, " +
        "country, " +
        "source, " +
        "window, " +
        "ROUND(SUM(ProjectedARPI*PlayerCount) / SUM(PlayerCount), 2) AS ProjectedARPI, " +
        "ROUND(SUM(ProjectedARPIOrganicMed*PlayerCount) / SUM(PlayerCount), 2) AS ProjectedARPIOrganicMed, " +
        "SUM(PlayerCount) AS PlayerCount, " +
        "SUM(PayerCount) AS PayerCount, " +
        "CASE WHEN( SUM(PlayerCount) > 500 AND SUM(PayerCount) > 10) THEN TRUE ELSE FALSE END AS isSignificant " +
        "FROM UA_dashboard " +
        "WHERE PlayerCount > 0 " +
        "GROUP BY  Install_dt, Platform, country, source " +
        "ORDER BY  Platform, country, source, Install_dt"+
        "LIMIT "+((parseInt(pageindex) -1) * 10)+" OFFSET "+pagesize ;
        
    //console.log(selectquery);
    logger.info(selectquery);
    return selectquery;
}


module.exports = router;