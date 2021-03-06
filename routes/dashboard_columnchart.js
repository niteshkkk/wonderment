var express = require('express');
var router = express.Router();
var HTTPClient = require('httpclient');
var config = require('../config');
var async = require("async");
var dateFormat = require('dateformat');
var now = new Date();
var moment = require('moment');
var hbs = require('hbs');
var fs=require('fs');
var _ = require('underscore');
var shortid = require('shortid');
var csv = require('fast-csv');
var logger = require("../utils/logger").appLogger;

//ON PAGE LOAD & ON ORGANIZATION CHANGE
router.get('/',function(req, res){
	var token = req.cookies.authtoken;
	var email = req.cookies.authuser;
	var name = req.cookies.authname;
	var role = req.cookies.utype;
	var titleQuery = req.query.title;
	var title  = "";
	var organization = req.query.org;
	var reporttitlename = req.query.reporttitlename ? req.query.reporttitlename : '';
	var userTitleInfo={};
	var reportCollection={};

	var options = {
	    hostname: 'localhost',
	    path: '/',
	    port: 3000,
	    secure: false,
	    method: 'GET',
	    "content-type": 'application/json',
	    headers:{
	      "Authorization" : "Bearer " + token
	    }
	};

	var httpClient = new HTTPClient(options);

	async.waterfall([
	    function(callback){
	    	//console.log('1st Step');
	    	logger.info('1st Step');
	    	var userdata,isAdmin = false, adminReports;
	    	if(role == "SuperAdmin"){
	    		isAdmin = true;
	    		userdata = {};
	    		if(organization){
	    			getAdminData(function(user_data){
							userdata = user_data;
							var organizationArray = _.pluck(userdata.allOrganizations, 'name');				            
				    		if(titleQuery){
				    			userdata.reportsByFirstTitle = _.where(userdata.allReports,{organization: organization, title: titleQuery});
				    		}else{
				    			var titleArray = _.pluck(_.first(_.pluck(_.where(_.pluck(userdata.allGameTitles, 'organization'),{name: organization}), 'titles')), 'name');
					    		userdata.reportsByFirstTitle = _.where(userdata.allReports,{organization: organization, title: titleArray[0]});
					    	}
				    		adminReports = {data: userdata.reportsByFirstTitle};
				    		reportCollection =  adminReports;
				    		name = userdata.userdata.firstName;
				    		userTitleInfo = {user:userdata.userdata};
				    		userTitleInfo.user.Organizations = userdata.allOrganizations;
				    		userTitleInfo.user.selectedOrganization = organization;
				    		
				    		userTitleInfo.user.GameTitles = _.first(_.pluck(_.where(_.pluck(userdata.allGameTitles, 'organization'),{name: organization}), 'titles'));
				    		if(titleQuery){
				    			userTitleInfo.user.selectedGameTitle = titleQuery;
				    		} else if(userTitleInfo.user.GameTitles && userTitleInfo.user.GameTitles.length > 0){
				    			userTitleInfo.user.selectedGameTitle = userTitleInfo.user.GameTitles[0].name;
				    		}
				    		//console.log('reportsdata', JSON.stringify(userTitleInfo.user));
			    				
							callback(null, organization, adminReports, isAdmin);
						});
	    		}else{
	    			getAdminData(function(user_data){
						userdata = user_data;
						var organizationArray = _.pluck(userdata.allOrganizations, 'name');
			            var titleArray = _.pluck(_.first(_.pluck(_.where(_.pluck(userdata.allGameTitles, 'organization'),{name: organizationArray[0]}), 'titles')), 'name');
			            organization = organizationArray[0];
			    		adminReports = {data: userdata.reportsByFirstTitle};
			    		reportCollection =  adminReports;
			    		name = userdata.userdata.firstName
			    		userTitleInfo = {user:userdata.userdata};
			    		userTitleInfo.user.Organizations = userdata.allOrganizations;
			    		userTitleInfo.user.selectedOrganization = organization;			    		
			    		userTitleInfo.user.GameTitles = _.first(_.pluck(_.where(_.pluck(userdata.allGameTitles, 'organization'),{name: organizationArray[0]}), 'titles'));
			    		if(userTitleInfo.user.GameTitles && userTitleInfo.user.GameTitles.length > 0){
			    			userTitleInfo.user.selectedGameTitle = userTitleInfo.user.GameTitles[0].name;
			    		}
			    		// console.log('reportsdata', JSON.stringify(userTitleInfo.user));
		    				
						callback(null, organization, adminReports, isAdmin);
					});	
	    		}				    		
	    	}else{
	    		getUserData(email, reporttitlename, function(user_data){
	    			userdata = user_data.user;	    				
	    			getReportCollection(titleQuery, user_data, function(reports){
	    				reportCollection = reports.reportCollection;
	    				userTitleInfo = reports.userdata;
	    				console.log('testing', userTitleInfo);
	    				name =  userdata.firstName;
	    				organization = reports.userdata.organization;
	    				callback(null, organization, reportCollection, isAdmin);
	    			});	    			
	    		});
	    	}	        
	    },
	    function(organization, reportCollection, isAdmin, callback){
	    	//console.log(organization);
	    	//console.log(reportCollection);
	    	//console.log(isAdmin);
	    	//console.log('2nd Step');    	
	    	logger.info('2nd Step');
	    	var dateMax = dateFormat(new Date(), "yyyy-mm-dd");
			var dateMin = dateFormat((new Date()).setDate((new Date()).getDate() - 30), "yyyy-mm-dd"); // one year gap
			
			var collection = {
				dateMin : dateMin,
				dateMax :dateMax
			};

			// if there is any repport
			if(reportCollection.data.length > 0){
				dateMin= dateFormat(reportCollection.data[0].cohortstartdate.substring(0,10).replace(/\-/g, '/'), "yyyy-mm-dd");
				//dateMax= dateFormat(reportCollection.data[0].cohortenddate.substring(0,10).replace(/\-/g, '/'), "yyyy-mm-dd");
				collection.dateMin = dateMin;
				collection.dateMax = dateMax;

				collection.platforms = _.pluck(reportCollection.data[0].platforms, 'name');
				collection.sources = _.pluck(reportCollection.data[0].sources, 'name');
				collection.country = reportCollection.data[0].country;
				collection.horizon = reportCollection.data[0].horizon;
			}

			if(userTitleInfo.user.role == "SuperAdmin")
				{
					collection.org = userTitleInfo.user.selectedOrganization;
					collection.game = userTitleInfo.user.selectedGameTitle;
				}
				else
				{
					collection.org =  userTitleInfo.user.organization;
					collection.game =  userTitleInfo.user.firstTitle;
				}

			filterDataByDate(collection, function(returnReportCollection){
				if(returnReportCollection.error){
					callback(returnReportCollection);
				}else{
					callback(null, returnReportCollection.data);
				}
			});

	        // arg1 now equals 'one' and arg2 now equals 'two'
	    },
	    function(returnReportCollection, callback){
	    	//console.log('3rd Step');
	    	logger.info('3rd Step');
	        var gridParams = {
				"dateMin": returnReportCollection.dateMin,
				"dateMax": returnReportCollection.dateMax,
				"gridPlatform": returnReportCollection.gridPlatform,
				"gridSource": returnReportCollection.gridSource,
				"countryvalue": returnReportCollection.countryvalue,
				"horizon": returnReportCollection.horizon_value,
				"org" : returnReportCollection.org,
				"game": returnReportCollection.game					
			};

			getGridAndChartData(gridParams, function(returnChartnGridValue){
				if(returnChartnGridValue.error){
					callback(returnChartnGridValue);
				}else{
					callback(null, returnChartnGridValue.data, returnReportCollection);
				}
			});	        
	    }], 
	    function (err, prepareGridAndChartData, preparefilters) {
	    	if(err){
	    		logger.error(new Error(err));
	    		res.render('error', err);
	    	}else{
		   		var chartdata = prepareGridAndChartData.chartdata;
				var nodata = false;
				if(Object.keys(chartdata).length<=0){
					nodata = true;
				}
				
				var newplatform=preparefilters.platformsvalue;  
				newplatform = newplatform.replace(/,\s*$/, "");
				var newsources=preparefilters.sourcevalue.replace(/,\s*$/, ""); 

				res.render('dashboard_columnchart',{
			        		"charttype" : "column",
							"usertitledetails": userTitleInfo.user,
							"reportList": reportCollection.data,
							"bindgrid": prepareGridAndChartData.bindgrid,
							"gridreportdata": prepareGridAndChartData.gridreportdata,
			        		"columnchartdata": chartdata,
			        		"checkSourceplatform": preparefilters.checkplatform,
							"checkSourcecountry": preparefilters.checkcountry,
							"checkSourcesources": preparefilters.checksources,
							"name": name,
							"sourcevaluetodisplay": newsources,
							"paltformvaluetodisplay" : newplatform,
							"countryvaluetodisplay" : preparefilters.countryvalue,
							"horizon_value": preparefilters.horizon_default,
							"dateMinChart": preparefilters.dateMin,
							"dateMaxChart": preparefilters.dateMax,
							"nodata": nodata
						}); 
			}
		});
	
}); // end route


// On Game title Click
router.get('/title',function(req, res){

	var token = req.cookies.authtoken;
	var email = req.cookies.authuser;
	var role = req.cookies.utype;
	var titleQuery=req.query.title;
	var title="";
	var organization=req.query.organization;
	var reportid = '';
	var reporttitlename ="";
	var userTitleInfo={};
	var reportCollection={};
	var options = {
		    hostname: 'localhost',
		    path: '/',
		    port: 3000,
		    secure: false,
		    method: 'GET',
		    "content-type": 'application/json',
		    headers:{
		      "Authorization" : "Bearer " + token
		    }
		 };

	var httpClient = new HTTPClient(options);

	// if(req.query.reporttitlename){
	// 	reporttitlename =req.query.reporttitlename;
	// }

	if(req.query.rid){
		reportid = req.query.rid;
	}

	var reportURL='/api/reporttitle';
	if(role === 'SuperAdmin'){
		reportURL = reportURL + "?&for=A&organization="+encodeURIComponent(organization) +"&title="+encodeURIComponent(titleQuery);
	}else{
		reportURL = reportURL + '?email=' + encodeURIComponent(email)+"&organization="+encodeURIComponent(organization) +"&title="+encodeURIComponent(titleQuery);
	}

	// if(reporttitlename){
	// 	reportURL = reportURL + "&reporttitlename="+encodeURIComponent(reporttitlename)
	// }
	
	if(reportid){
		reportURL = reportURL + "&reportid="+encodeURIComponent(reportid)
	}


	async.waterfall([
	    function(callback){
	    	//console.log('1st Step');
	    	 logger.info('1st Step');
	    	 logger.info("Sending http request to call reporttitle with url--- " + reportURL);
			 //console.log("Sending http request to call reporttitle with url--- "+reportURL);
			httpClient.request(reportURL,
				function (err, httpres, body) {
					if(err){
						//console.log('Error in aysn call for httprequest',err);
						 logger.error(new Error('Error in aysn call for httprequest' + err));
						callback(err);
					}else if(httpres.statusCode != config.codes.OK){
			            callback(body);
			        }else if(body){
						var apiResponse = JSON.parse(body);
						reportCollection=apiResponse;
						var newDate = new Date();
						var dateMax = dateFormat(newDate, "yyyy-mm-dd");
						var dateMin = dateFormat(newDate.setDate(newDate.getDate() - 30), "yyyy-mm-dd"); // one year gap
						var collection = {
			              	dateMin : dateMin,
			              	dateMax :dateMax
			            };

			          	// if there is any repport
				        if(reportCollection.data.length > 0){
							dateMin= dateFormat(reportCollection.data[0].cohortstartdate.substring(0,10).replace(/\-/g, '/'), "yyyy-mm-dd");
							//dateMax= dateFormat(reportCollection.data[0].cohortenddate.substring(0,10).replace(/\-/g, '/'), "yyyy-mm-dd");
							collection.dateMin = dateMin;
							collection.dateMax = dateMax;						
							collection.platforms = _.pluck(reportCollection.data[0].platforms, 'name');
							collection.sources = _.pluck(reportCollection.data[0].sources, 'name');
							collection.country = reportCollection.data[0].country;
							collection.horizon = reportCollection.data[0].horizon;
							collection.org = organization;
							collection.game = titleQuery;
				        }

				        callback(null, collection);			        
					}
			});
	    },
	    function(collection, callback){
	    	//console.log('2nd Step');
	    	logger.info('2nd Step');
	    	filterDataByDate(collection, function(returnReportCollection){
				callback(null, returnReportCollection.data);
			});
	    },
	    function(returnReportCollection, callback){
	    	//console.log('3rd Step');
	    	logger.info('3rd Step');
	    	var gridParams = {
							"dateMin": returnReportCollection.dateMin,
							"dateMax": returnReportCollection.dateMax,
							"gridPlatform": returnReportCollection.gridPlatform,
							"gridSource": returnReportCollection.gridSource,
							"countryvalue": returnReportCollection.countryvalue,
							"horizon": returnReportCollection.horizon_value,
							"org" : returnReportCollection.org,
							"game": returnReportCollection.game									
						};

			getGridAndChartData(gridParams, function(returnChartnGridValue){
				callback(null, returnChartnGridValue.data, returnReportCollection);
			});	        
	    }], 
	    function (err, prepareGridAndChartData, preparefilters) {
	   		//console.log('Rendring Data Started');
	   		logger.info('Rendring Data Started');
			var chartdata = prepareGridAndChartData.chartdata;
			var nodata = false;
			if(Object.keys(chartdata).length<=0){
        		nodata = true;
        	}
        	var platformchart=preparefilters.platformsvalue;
        	platformchart = platformchart.replace(/,\s*$/, "");
        	var newsources= preparefilters.sourcevalue.replace(/,\s*$/, ""); 
				        	
			res.render('partials/dashboardmaster',{
		        		"charttype" : "column",
						"reportList":reportCollection.data,
						"bindgrid": prepareGridAndChartData.bindgrid,
						"gridreportdata": prepareGridAndChartData.gridreportdata,
		        		"columnchartdata": chartdata,
		        		"checkSourceplatform": preparefilters.checkplatform,
						"checkSourcecountry": preparefilters.checkcountry,
						"checkSourcesources": preparefilters.checksources,								
						"sourcevaluetodisplay": newsources,
						"paltformvaluetodisplay" : platformchart,
						"countryvaluetodisplay" : preparefilters.countryvalue,
						"horizon_value": preparefilters.horizon_default,
						"dateMinChart": preparefilters.dateMin,
						"dateMaxChart": preparefilters.dateMax,
						 nodata:nodata
					});
			//console.log('Rendring Successfully!'); 
			logger.info('Rendring Successfully!');
		});
});//end on title click

// ON FILTER CHANGE
router.get('/gridviewfilterchange',function(req, res){
	var token = req.cookies.authtoken;
	var options = {
	    hostname: 'localhost',
	    path: '/',
	    port: 3000,
	    secure: false,
	    method: 'GET',
	    "content-type": 'application/json',
	    headers:{
	      "Authorization" : "Bearer " + token
	    }
	};

	var httpClient = new HTTPClient(options);

	var mindate = req.query.cohortstartdate;
	var maxdate = req.query.cohortendtdate;
	var platform = req.query.platforms;
	var sources = req.query.sources;
	var horizon = req.query.horizon;
	var country = req.query.country;
	var countrynew = JSON.stringify(country);
	var organiclift = req.query.organiclift;
	var gameTitle = req.query.gameTitle;
	var organization = req.query.org;

	 mindate = dateFormat(mindate.substring(0, 10).replace(/\-/g, '/'), "yyyy-mm-dd");
	maxdate = dateFormat(maxdate.substring(0, 10).replace(/\-/g, '/'), "yyyy-mm-dd");
	var gridPlatform = [];
	var gridSource = [];
	var platformstodisplay = "";
	var sourcetodisplay = "";

	for (i = 0; i < platform.length; i++) {
		gridPlatform.push(encodeURIComponent(platform[i]));
		platformstodisplay += platform[i] + ", ";
	}

	platformstodisplay = platformstodisplay.replace(/,\s*$/, "");

	for (i = 0; i < sources.length; i++) {
		gridSource.push(encodeURIComponent(sources[i]));
		sourcetodisplay += sources[i];
	}

	var gridParams = {
		"dateMin": mindate,
		"dateMax": maxdate,
		"gridPlatform": gridPlatform,
		"gridSource": gridSource,
		"countryvalue": country,
		"horizon": horizon,
		"sourcetodisplay": sourcetodisplay,
		"platformstodisplay": platformstodisplay,
		"org": organization,
		"game": gameTitle
	};

	getGridAndChartData(gridParams, function(returnChartnGridValue) {
		var chartdata = returnChartnGridValue.data.chartdata;
		var sources = _.pluck(chartdata, 'source'),
			projectiondates = _.pluck(chartdata, 'ProjectionDate'),
			uniqSources = _.uniq(sources),
			uniqProjectionDate = _.uniq(projectiondates),
			pair = {
				name: '',
				data: []
			},
			series = [];

		//console.log('chartdata.data', JSON.stringify(chartdata));
		// console.log(sources);
		// console.log(projectiondates);
		// console.log(uniqSources);
		// console.log(uniqProjectionDate);

		
		//console.log(JSON.stringify(series));
		var nodata = false;
		if (chartdata && Object.keys(chartdata).length <= 0) {
			nodata = true;
		}

		var platformsdisplaynew = gridParams.platformstodisplay.replace(/\s+/, "");
		res.render('partials/dashboardgridchart', {
			"charttype": "column",
			"bindgrid": returnChartnGridValue.data.bindgrid,
			"gridreportdata": returnChartnGridValue.data.gridreportdata,
			"sourcevaluetodisplay": gridParams.sourcetodisplay,
			"paltformvaluetodisplay": platformsdisplaynew,
			"countryvaluetodisplay": gridParams.countryvalue,
			"columnchartdata": chartdata,
			"dateMinChart": gridParams.dateMin,
			"dateMaxChart": gridParams.dateMax,
			"nodata": nodata

		});
	});
});

// ON COHORT DATE CHANGE
router.get('/cohortchange',function(req, res){
	var reportCollection = {
		'dateMin': req.query.cohortstartdate,
		'dateMax' : req.query.cohortendtdate,
		'platforms' : req.query.platforms,
		'sources' : req.query.sources,
		'horizon' : req.query.horizon,
		'country' : req.query.country,
		"org": req.query.org,
		"game": req.query.gameTitle
	};

	// console.log("----0", reportCollection.dateMin);

	async.waterfall([
		function(callback){
			filterDataByDate(reportCollection, function(returnReportCollection){
				callback(null, returnReportCollection.data);
			});
		},
		function(returnReportCollection, callback){
			var gridParams = {
				"dateMin": returnReportCollection.dateMin,
				"dateMax": returnReportCollection.dateMax,
				"gridPlatform": returnReportCollection.gridPlatform,
				"gridSource": returnReportCollection.gridSource,
				"countryvalue": returnReportCollection.countryvalue,
				"horizon": returnReportCollection.horizon_value,
				"org": returnReportCollection.org,
				"game": returnReportCollection.game			
			};
			getGridAndChartData(gridParams, function(returnChartnGridValue){
				callback(null, returnChartnGridValue.data, returnReportCollection);
			});
		}],
		function(err, prepareGridAndChartData, preparefilters){
			var chartdata = prepareGridAndChartData.chartdata;
			var nodata = false;
			if(Object.keys(chartdata).length<=0){
				nodata = true;
			}
		       	
			var newplatformdate= preparefilters.platformsvalue.replace(/,\s*$/, "");
			newplatformdate=newplatformdate.split(',').join(', ');
			if(newplatformdate === "All ") {
				newplatformdate=newplatformdate.replace(/\s+/, "");	        		
			}

			var newsources= preparefilters.sourcevalue.replace(/,\s*$/, ""); 
			newsources=newsources.split(',').join(', ');
			if(newsources === "All ") {
				newsources=newsources.replace(/\s+/, "");	        		
			}	     

			res.render('partials/dashboardmaster',{
        		"charttype" : "column",
				"reportList":reportCollection.data,
				"bindgrid": prepareGridAndChartData.bindgrid,
				"gridreportdata": prepareGridAndChartData.gridreportdata,
        		"columnchartdata": chartdata,
        		"checkSourceplatform": preparefilters.checkplatform,
				"checkSourcecountry": preparefilters.checkcountry,
				"checkSourcesources": preparefilters.checksources,						
				"sourcevaluetodisplay": newsources,
				"paltformvaluetodisplay" : newplatformdate,
				"countryvaluetodisplay" : preparefilters.countryvalue,
				"horizon_value": preparefilters.horizon_default,
				"dateMinChart": preparefilters.dateMin,
				"dateMaxChart": preparefilters.dateMax,						
				"nodata":nodata
			});
		});
});//ENd of cohortchange


router.get('/expfile',function(req, res){
	logger.info('In Export File UA_Dashboard Route');		
	var token = req.cookies.authtoken;
	var options = {
	    hostname: 'localhost',
	    path: '/',
	    port: 3000,
	    secure: false,
	    method: 'GET',
	    "content-type": 'application/json',
	    headers:{
	      "Authorization" : "Bearer " + token
	    }
	};

	var httpClient = new HTTPClient(options);

	var mindate = req.query.cohortstartdate;
	var maxdate = req.query.cohortendtdate;
	var platform = req.query.platforms;
	var sources = req.query.sources;
	var horizon = req.query.horizon;
	var country = req.query.country;
	var organiclift = req.query.organiclift;
	var gameTitle = req.query.gameTitle;
	var organization = req.query.org;
	var datesForExportName = dateFormat(dateMin.substring(0, 10).replace(/\-/g, '/'), "mm-dd-yy") +'_'+dateFormat(dateMax.substring(0, 10).replace(/\-/g, '/'), "mm-dd-yy")
	var filename = "ua-dashboard_" + req.query.gameTitle.replace(/\ /g, '_') + "_"+ datesForExportName;
	

	mindate = dateFormat(mindate.substring(0, 10).replace(/\-/g, '/'), "yyyy-mm-dd");
	maxdate = dateFormat(maxdate.substring(0, 10).replace(/\-/g, '/'), "yyyy-mm-dd");
	var gridPlatform = [];
	var gridSource = [];

	for (i = 0; i < platform.length; i++) {
		gridPlatform.push(encodeURIComponent(platform[i]));
	}

	for (i = 0; i < sources.length; i++) {
		gridSource.push(encodeURIComponent(sources[i]));
	}

	var gridParams = {
		"dateMin": mindate,
		"dateMax": maxdate,
		"gridPlatform": gridPlatform,
		"gridSource": gridSource,
		"countryvalue": country,
		"horizon": horizon,
		"org": organization,
		"game": gameTitle
	};
	

		var MysqlurlGrid ="";
		MysqlurlGrid ='/api/dashboardapiGridView?mindate='+ encodeURIComponent(mindate) + '&maxdate=' +encodeURIComponent(maxdate);
		MysqlurlGrid +=  '&platform='+(JSON.stringify(gridParams.gridPlatform));
		MysqlurlGrid +=  '&sources='+(JSON.stringify(gridParams.gridSource));
		MysqlurlGrid += '&country="' + encodeURIComponent(gridParams.countryvalue) + '"';
		MysqlurlGrid += '&organiclift=' + encodeURIComponent(true);
		MysqlurlGrid += '&horizon=' + encodeURIComponent(gridParams.horizon);
		MysqlurlGrid += '&org=' + encodeURIComponent(gridParams.org);
		MysqlurlGrid += '&game=' + encodeURIComponent(gridParams.game);
	
		logger.info(MysqlurlGrid);

		httpClient.request(MysqlurlGrid, 
			function (err, httpres, body){
				if(err){
					//console.log('error in calling usertitle api',err);
					logger.error(new Error('Error exporting csv---' + err));
				}
				if(httpres.statusCode != config.codes.OK){
					logger.error(new Error('Error exporting csv---'+body));
				}
				if(body){
					logger.info("Preparing data for csv to Export");
					
					var apiresult = JSON.parse(body);
					var result = apiresult.resultsvalues;
					var parentArr=[["Platform", "Source","Horizon","Country","Projected ARPI","Player Count","Payer Count","Cohort Date"]];
					for(var i=0;i<result.length;i++){
						var arr =[];
						arr.push(result[i].Platform);
						arr.push(result[i].source);
						arr.push(result[i].window);
						arr.push(result[i].country);
						arr.push(result[i].ProjectedARPI);
						arr.push(result[i].PlayerCount);
						arr.push(result[i].PayerCount);
						dateformatechange = dateFormat(result[i].Cohort_Date,"mm-dd-yyyy");

						arr.push(dateformatechange);
						parentArr.push(arr);
					}

					var ws = fs.createWriteStream('public/download/'+filename+'.csv');
					csv.write(parentArr, {headers: true}).pipe(ws);

					ws.on("finish", function(){
					res.status(config.codes.OK).send(filename); 
					//console.log("DONE!");
					logger.info("CSV created Successfully!");
					});
				}
		});
});


var getAdminData = function(callback){
	var options = {
	    hostname: 'localhost',
	    path: '/',
	    port: 3000,
	    secure: false,
	    method: 'GET',
	    "content-type": 'application/json',
	    headers:{
	      "Authorization" : "Bearer "
	    }
	};

	var httpClient = new HTTPClient(options);
	var userdata = {
			'userdata': '',
			'allOrganizations': '',
			'allGameTitles': '',
			'allReports': '',
			'reportsByFirstTitle': '',
			'error': ''
		};
		httpClient.request('/admindata',  
			        function (err, httpres, body) {
						if(err){
							//console.log('ERROR - In httpreqest for admindata api',err);
							logger.error(new Error('ERROR - In httpreqest for admindata api'+ err));
							userdata.error = err;
							callback(userdata);
						}else if(httpres.statusCode != config.codes.OK){
							userdata.error = JSON.parse(body).message;
							callback(userdata);
						}else if(body){
							var apiResponse = JSON.parse(body);
							//console.log('admindatares',JSON.stringify(apiResponse));
							userdata.userdata = apiResponse.user;
							userdata.allOrganizations = apiResponse.organizations;
		                    userdata.allGameTitles = apiResponse.titles;
		                    userdata.allReports = apiResponse.reporttitles;
		                    var organizationArray = _.pluck(userdata.allOrganizations, 'name');
		                    var titleArray = _.pluck(_.first(_.pluck(_.where(_.pluck(userdata.allGameTitles, 'organization'),{name: organizationArray[0]}), 'titles')), 'name');
		                    userdata.reportsByFirstTitle = _.where(userdata.allReports,{organization: organizationArray[0], title: titleArray[0]});

		                    // console.log(JSON.stringify(userdata));
				    		
				    		callback(userdata);
						}
			          });
}

var getUserData = function(email, reporttitlename, callback){
	var options = {
	    hostname: 'localhost',
	    path: '/',
	    port: 3000,
	    secure: false,
	    method: 'GET',
	    "content-type": 'application/json',
	    headers:{
	      "Authorization" : "Bearer "
	    }
	};

	var httpClient = new HTTPClient(options);
	console.log('getUserData Start');
	var response = {
			'reporttitlename': '',
			'user': '',
			'error': ''
		};
	httpClient.request('/api/usertitle/?email=' + encodeURIComponent(email),  
	        function (err, httpres, body) {
				if(err){
					//console.log('ERROR - In httprequest for usertitle api',err);
					logger.error(new Error('ERROR - In httprequest for usertitle api'+ err));
					response.error = err;
					callback(response);
				}else if(httpres.statusCode != config.codes.OK){
					response.error = JSON.parse(body).error;
					callback(response);
				}else if(body){
					var apiResponse = JSON.parse(body);
					// console.log('getUserData',JSON.stringify(apiResponse));
					response.reporttitlename = reporttitlename ? reporttitlename : '';
					response.user = apiResponse.data;

					callback(response);
				}
	          });
	console.log('getUserData End');
}

var filterDataByDate = function(reportCollection, callback){
	var options = {
	    hostname: 'localhost',
	    path: '/',
	    port: 3000,
	    secure: false,
	    method: 'GET',
	    "content-type": 'application/json',
	    headers:{
	      "Authorization" : "Bearer "
	    }
	};

	var httpClient = new HTTPClient(options);

	var response = {
		data: '',
		error: ''
	}

	var dateMin = dateFormat(reportCollection.dateMin.replace(/\-/g, '/'), "yyyy-mm-dd"),
		dateMax = dateFormat(reportCollection.dateMax.replace(/\-/g, '/'), "yyyy-mm-dd");

	var Mysqlurlfordropdownbinding ='/api/dashboardapifilterdata?for=C&mindate='+ encodeURIComponent(dateMin) + '&maxdate=' +encodeURIComponent(dateMax);
	Mysqlurlfordropdownbinding += '&org=' + encodeURIComponent(reportCollection.org);
	Mysqlurlfordropdownbinding += '&game=' + encodeURIComponent(reportCollection.game);
	httpClient.request(Mysqlurlfordropdownbinding, 
		    	function (err, httpres, body) {
		    		if(err){
		    			//console.log('dashboard_columnchart_routes -- Error in http request - Mysqlurl',err);
		    			logger.error(new Error('dashboard_columnchart_routes -- Error in http request - Mysqlurl' + err));
		    			response.error = 'dashboard_columnchart_routes -- Error in http request - Mysqlurl';
		    			callback(response);
		    		}else if(httpres.statusCode == config.codes.NOTIMPLEMENTED){
		    			response.error = JSON.parse(body).error;
		    			callback(response);
					}else if(httpres.statusCode != config.codes.OK){
		    			response.error = body;
		    			callback(response);
					}else if(body){	    			
						var apiResponse = JSON.parse(body);
						var platformsvalue = "";
						var sourcevalue = "";
						var countryvalue = "";
						var checkplatform = [];
						var checkcountry = [];
						var checksources = [];
						var gridPlatform = [];
						var gridSource = [];
				 		var horizon_value = "";
		 				var horizon_default = [
							{ "value" : "90", "selected" : false},
							{ "value" : "180", "selected" : false},
							{ "value" : "365", "selected" : false}
						];
						for(j=0; j< apiResponse.resultsdata.Platform.length; j++){	
							checkplatform.push( {"PlatformName": apiResponse.resultsdata.Platform[j], "SourceChecked": false});
						}

						for(m=0; m< apiResponse.resultsdata.Country.length; m++){
							checkcountry.push( {"CountryName": apiResponse.resultsdata.Country[m], "SourceChecked": false});			 	
						}
						for(n=0; n< apiResponse.resultsdata.Source.length; n++){
							checksources.push({"SorceName": apiResponse.resultsdata.Source[n], "SourceChecked": false});
						}


						if (reportCollection.platforms && reportCollection.country && reportCollection.sources && reportCollection.horizon) {
							for (var m =0; m<checkplatform.length ;m++){
								for(i=0; i< reportCollection.platforms.length; i++){
									if(reportCollection.platforms[i] && reportCollection.platforms[i] == "All"){
									platformsvalue = "All";
									gridPlatform.push("All");
									}
									else if(reportCollection.platforms[i].trim() == checkplatform[m].PlatformName){
										checkplatform[m].SourceChecked=true;
										platformsvalue += checkplatform[m].PlatformName.trim() + ", ";
										gridPlatform.push(encodeURIComponent(checkplatform[m].PlatformName));
									}
								}
							}

							for (var m =0; m<checkcountry.length ;m++){
								if(reportCollection.country == "All"){
									countryvalue = "All";
								}
								if (reportCollection.country.trim() == checkcountry[m].CountryName) {
								   checkcountry[m].SourceChecked = true;
								   countryvalue += checkcountry[m].CountryName
								   break;
								}			 		
							}

							for (var m =0; m<checksources.length; m++){
								for(i=0; i< reportCollection.sources.length; i++){

									if(reportCollection.sources[i] && reportCollection.sources[i] == "All"){
										sourcevalue = "All";
										gridSource.push("All");
										break;

							 		}					
							 		if(reportCollection.sources[i].trim() == checksources[m].SorceName)
							 		{
							 				checksources[m].SourceChecked=true;
							 				sourcevalue += checksources[m].SorceName.trim() + ", ";
							 				gridSource.push(encodeURIComponent(checksources[m].SorceName));
							 		}					 		
								}
							}

							for(i=0; i<horizon_default.length; i++){
								if(horizon_default[i].value == reportCollection.horizon){
									horizon_default[i].selected = true;
									horizon_value =  reportCollection.horizon;
								}
							}
						} else {
							platformsvalue = "All";
							gridPlatform.push("All");
							gridSource.push("All");
							sourcevalue = "All";
							countryvalue = "All";
							horizon_default[0].selected = true;
						}

						if(gridSource.length <=0){
							sourcevalue = "All";
							gridSource.push("All");
						}
						if(gridPlatform.length <= 0){
							platformsvalue = "All";
							gridPlatform.push("All");
						}
						if(!countryvalue){
							countryvalue = "All";
						}

						var selectedreportcollection = {

							platformsvalue: platformsvalue,
							countryvalue : countryvalue,
							sourcevalue : sourcevalue,
							checksources : checksources,
							checkplatform : checkplatform,
							checkcountry : checkcountry, 
							gridPlatform: gridPlatform,
							gridSource: gridSource,
							horizon_default: horizon_default,
							horizon_value: horizon_value,
							dateMin : reportCollection.dateMin,
							dateMax : reportCollection.dateMax,
							org: reportCollection.org,
							game: reportCollection.game
						};

						response.data = selectedreportcollection;

						callback(response);
				}
		}); // end http request Mysqlurl
}

var getGridAndChartData = function(gridParams, callback){
	var options = {
	    hostname: 'localhost',
	    path: '/',
	    port: 3000,
	    secure: false,
	    method: 'GET',
	    "content-type": 'application/json',
	    headers:{
	      "Authorization" : "Bearer "
	    }
	};

	var httpClient = new HTTPClient(options);
	var response = {
		data: '',
		error: ''
	}

	var dateMin = dateFormat(gridParams.dateMin.replace(/\-/g, '/'), "yyyy-mm-dd"),
		dateMax = dateFormat(gridParams.dateMax.replace(/\-/g, '/'), "yyyy-mm-dd");

		async.parallel([function(callback){
			var MysqlurlGrid ="";
				MysqlurlGrid ='/api/dashboardapiGridView?mindate='+ encodeURIComponent(dateMin) + '&maxdate=' +encodeURIComponent(dateMax);
				MysqlurlGrid +=  '&platform='+(JSON.stringify(gridParams.gridPlatform));
				MysqlurlGrid +=  '&sources='+(JSON.stringify(gridParams.gridSource));
				MysqlurlGrid += '&country="' + encodeURIComponent(gridParams.countryvalue) + '"';
				MysqlurlGrid += '&organiclift=' + encodeURIComponent(true);
				MysqlurlGrid += '&horizon=' + encodeURIComponent(gridParams.horizon);
				MysqlurlGrid += '&org=' + encodeURIComponent(gridParams.org);
				MysqlurlGrid += '&game=' + encodeURIComponent(gridParams.game);
				//console.log(MysqlurlGrid)
      		var horizon_value = gridParams.horizon_value;
			httpClient.request(MysqlurlGrid,
					function (err, httpres, body) {
						if(err){
							//console.log('dashboard_columnchart -- Error in http request for MysqlurlGrid',err);
							logger.error(new Error('dashboard_columnchart -- Error in http request for MysqlurlGrid' + err));
							return callback(err);
						} else if(httpres.statusCode != config.codes.OK){
							logger.error(new Error('dashboard_columnchart -- Error in' + MysqlurlGrid));
							return callback('dashboard_columnchart -- Error in' + MysqlurlGrid);
						} else if(body){
							var apiMysqlurlGridResponse = JSON.parse(body);

							var gridreportdata = [];
							for(var i=0; i< apiMysqlurlGridResponse.resultsvalues.length; i++){
								var row = apiMysqlurlGridResponse.resultsvalues[i];
								var cohortdate = row.Cohort_Date ? dateFormat(row.Cohort_Date.slice(0, 10).replace(/\-/g, '/'), "mm-dd-yyyy") : '';
								gridreportdata.push({
									Cohort_Date: cohortdate,
									Platform: row.Platform ? row.Platform : '',
									country: row.country ? row.country : '',
									source: row.source ? row.source : '',
									window: row.window,
									ProjectedARPI: row.ProjectedARPI ? row.ProjectedARPI : 0,
									PlayerCount: row.PlayerCount ? row.PlayerCount : 0,
									PayerCount: row.PayerCount ? row.PayerCount : 0
								});
							}

							var MysqlurlGridResponse = {									
								"bindgrid":apiMysqlurlGridResponse.resultsvalues.slice(0, 10),
								"gridreportdata": escape(JSON.stringify(gridreportdata)),
              					"horizon_value": horizon_value,
							};
							//console.log("MysqlurlGridResponse---", MysqlurlGridResponse.length);
							return callback(null,MysqlurlGridResponse);	
						}
					}); // end http client dashboardapiChartView	

		},function(callback){
			var chartUrl ="";
			chartUrl ='/api/dashboardapiChartView?mindate='+ encodeURIComponent(dateMin) + '&maxdate=' +encodeURIComponent(dateMax);
			chartUrl +=  '&platform='+(JSON.stringify(gridParams.gridPlatform));
			chartUrl +=  '&sources='+(JSON.stringify(gridParams.gridSource));
			chartUrl += '&country="' + encodeURIComponent(gridParams.countryvalue) + '"';
			chartUrl += '&organiclift=' + encodeURIComponent(true);
			chartUrl += '&horizon=' + encodeURIComponent(gridParams.horizon);
			chartUrl += '&org=' + encodeURIComponent(gridParams.org);
			chartUrl += '&game=' + encodeURIComponent(gridParams.game);
			httpClient.request(chartUrl,
					function (err, httpres, body) {
						if(err){
							//console.log('dashboard_columnchart -- Error in http request for chartUrl',err);
							logger.error(new Error('dashboard_columnchart -- Error in http request for chartUrl' + err));
							return callback(err);
						} else if(httpres.statusCode != config.codes.OK) {
							//console.log('dashboard_columnchart -- Error in' + chartUrl);
							logger.error(new Error('dashboard_columnchart -- Error in' + chartUrl));
							return callback('dashboard_columnchart -- Error in' + chartUrl);
						} else if(body){
							var chartApiResponse = JSON.parse(body);
							return callback(null, {
								"chartdata":chartApiResponse.chartresultsvalues
							});	
						}
					}); // end http client dashboardapiChartView
		}],function(err, results){
	    	if (err) {
	            //console.log("Error in async calls--- ",err);
	            logger.error(new Error("Error in async calls--- " + err));
	            response.error = "Error in async call";	            
	        }  else if(results){
	        	var nodata =false;
	          	if(Object.keys(results[1].chartdata).length <= 0){
		        	nodata = true;
		        }
			    var querydata = {
					"chartdata": results[1].chartdata,
					"bindgrid": results[0].bindgrid,
					"gridreportdata": results[0].gridreportdata,
        			"horizon_value": results[0].horizon_value,
					"nodata": nodata
				};
						
				response.data = querydata;	
				callback(response);
	        }
		});
	}// end prepareGridAndChartData



 // get report title infomation STARTS


var getReportCollection = function(titleQuery, userdata, callback){
	var options = {
	    hostname: 'localhost',
	    path: '/',
	    port: 3000,
	    secure: false,
	    method: 'GET',
	    "content-type": 'application/json',
	    headers:{
	      "Authorization" : "Bearer "
	    }
	};

	var httpClient = new HTTPClient(options);
	var title, response = {
		userdata: '',
		reportCollection: '',
		error: ''
	}
	if(typeof titleQuery==='undefined'){
		for (var i in userdata.user.titles) {
			title = userdata.user.titles[i].name;
			break;
		}
	}else{
		title = titleQuery;
	}

	userdata.user.firstTitle = title;

	var reportURL='/api/reporttitle?email=' + encodeURIComponent(userdata.user.email)+"&organization="+encodeURIComponent(userdata.user.organization) +"&title="+encodeURIComponent(title);
	if(userdata.reporttitlename){
		reportURL = reportURL + "&reporttitlename="+encodeURIComponent(userdata.reporttitlename)
	}

	//console.log("reporttitle URL - "+reportURL);

	httpClient.request(reportURL,  
        function (err, httpres, body) {
			if(err){
				//console.log('ERROR - In httprequest for reporttitle api',err);
				logger.info('ERROR - In httprequest for reporttitle api' + err);
				response.error = err;
				callback(response);
			}else if(httpres.statusCode != config.codes.OK){
				response.error = JSON.parse(body).message;
				callback(response);
			}else if(body){
				var apiResponse = JSON.parse(body);
				response.reportCollection=apiResponse;
				response.userdata = userdata;

				callback(response);
	        }
        });
}

var getfilteronDatebasis = function(httpClient, res, reportCollection, callback){

	var dateMin = dateFormat(reportCollection.dateMin.replace(/\-/g, '/'), "yyyy-mm-dd"),
		dateMax = dateFormat(reportCollection.dateMax.replace(/\-/g, '/'), "yyyy-mm-dd");

	var Mysqlurlfordropdownbinding ='/api/dashboardapifilterdata?for=C&mindate='+ encodeURIComponent(dateMin) + '&maxdate=' +encodeURIComponent(dateMax);
	httpClient.request(Mysqlurlfordropdownbinding, 
		    	function (err, httpres, body) {
		    		if(err){
		    			//console.log('dashboard_columnchart_routes -- Error in http request - Mysqlurl',err);
		    			logger.error(new Error('dashboard_columnchart_routes -- Error in http request - Mysqlurl' + err));
		    			res.render('error', {
							"message": err
						});
		    		}

		    		if(httpres.statusCode != config.codes.OK){
		    			//console.log(httpres);
						res.render('error', {
							"message": JSON.parse(body)
						});
					}

		    		if(body){	    			
						var apiResponse = JSON.parse(body);
						//console.log("Mysqlurl apiResponse---", apiResponse.resultsdata);

						
						
							var platformsvalue = "";
							var sourcevalue = "";
							var countryvalue = "";
							var checkplatform = [];
							var checkcountry = [];
							var checksources = [];
							var gridPlatform = [];
							var gridSource = [];
  				// 			var noreport = false;
  				 			var horizon_value = "";
  				 				var horizon_default = [
														{ "value" : "90", "selected" : false},
														{ "value" : "180", "selected" : false},
														{ "value" : "365", "selected" : false},
													  ];

							

							
							for(j=0; j< apiResponse.resultsdata.Platform.length; j++){	
								checkplatform.push( {"PlatformName": apiResponse.resultsdata.Platform[j], "SourceChecked": false});
							}

							for(m=0; m< apiResponse.resultsdata.Country.length; m++){
								checkcountry.push( {"CountryName": apiResponse.resultsdata.Country[m], "SourceChecked": false});			 	
							}
							for(n=0; n< apiResponse.resultsdata.Source.length; n++){
								checksources.push({"SorceName": apiResponse.resultsdata.Source[n], "SourceChecked": false});
							}


							if(Object.keys(reportCollection).length>2)
							{

								for (var m =0; m<checkplatform.length ;m++){
									for(i=0; i< reportCollection.platforms.length; i++){
										if(reportCollection.platforms[i] && reportCollection.platforms[i] == "All"){
										platformsvalue = "All";
										gridPlatform.push("All");
										}
										else if(reportCollection.platforms[i].trim() == checkplatform[m].PlatformName){
											checkplatform[m].SourceChecked=true;
											platformsvalue += checkplatform[m].PlatformName.trim() + ", ";
											gridPlatform.push(encodeURIComponent(checkplatform[m].PlatformName));
										}
									}
								}


								for (var m =0; m<checkcountry.length ;m++){
									if(reportCollection.country == "All"){
										countryvalue = "All";
									}
									if (reportCollection.country.trim() == checkcountry[m].CountryName) {
									   checkcountry[m].SourceChecked = true;
									   countryvalue += checkcountry[m].CountryName
									   break;
									}			 		
								}

								for (var m =0; m<checksources.length; m++) 
									{
										for(i=0; i< reportCollection.sources.length; i++){

											if(reportCollection.sources[i] && reportCollection.sources[i] == "All"){
												sourcevalue = "All";
												gridSource.push("All");
												break;

									 		}					
									 		if(reportCollection.sources[i].trim() == checksources[m].SorceName)
									 		{
									 				checksources[m].SourceChecked=true;
									 				sourcevalue += checksources[m].SorceName.trim() + ", ";
									 				gridSource.push(encodeURIComponent(checksources[m].SorceName));
									 		}					 		
										}
									}


									for(i=0; i<horizon_default.length; i++ )
									{
											if(horizon_default[i].value == reportCollection.horizon)
											{
												horizon_default[i].selected = true;
												horizon_value =  reportCollection.horizon;
											}
									}
							}//end of if reportcollection has length

							else{
								platformsvalue = "All";
								gridPlatform.push("All");
								gridSource.push("All");
								sourcevalue = "All";
								countryvalue = "All";
								horizon_default[0].selected = true;
							}

							if(gridSource.length <=0)
							{
								sourcevalue = "All";
								gridSource.push("All");
							}
							if(gridPlatform.length <= 0)
							{
								platformsvalue = "All";
								gridPlatform.push("All");
							}
							if(!countryvalue)
							{
								countryvalue = "All";
							}
							var selectedreportcollection = {

								platformsvalue: platformsvalue,
								countryvalue : countryvalue,
								sourcevalue : sourcevalue,
								checksources : checksources,
								checkplatform : checkplatform,
								checkcountry : checkcountry, 
								gridPlatform: gridPlatform,
								gridSource: gridSource,
								horizon_default: horizon_default,
								horizon_value: horizon_value,
								dateMin : reportCollection.dateMin,
								dateMax : reportCollection.dateMax
							};

							callback(selectedreportcollection);							 
					} else{
						res.render('error', {
								"message": err
							});
					}
		}); // end http request Mysqlurl

}


module.exports = router;
