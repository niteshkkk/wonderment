var express = require('express');
var validator = require('express-validator');
var hbs = require('hbs');
var path = require('path');
var app = express();
var moment = require('moment');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql= require('mysql');
var dbConfig = require('./db');
var csvWriter = require('csv-write-stream');
var fs = require('fs');

var dbURI = dbConfig.url;
var mongoose = require('mongoose/');
var validate = require('form-validate');
var logger = require("./utils/logger").appLogger;
var utils = require("./utils/utils");
var config = require('./config');

hbs.registerHelper('removespecials', function(str){
    //return str.replace(/[^a-zA-Z0-9]/g, "");
    return str;
});

hbs.registerHelper('removespace', function(str){
    return str ? str.replace(/ /g,'') : str;
});

hbs.registerHelper('csv', function(items, options) {
      return options.fn(items.join(', '));
});

hbs.registerHelper('getpreviousyeardate',function(date){
    if(date){
        date = new Date(date);
        var newdate = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear()-1;
        return new Date(newdate).toString('MMM d, yyyy');
    }else{
        return new Date('01/01/2015').toString('MMM D, YYYY');
    }
});

hbs.registerHelper('equal', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if( lvalue!=rvalue ) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

hbs.registerHelper('hbslogger', function(message){
    logger.info(message);
    return true;
});

// hbs.registerHelper('csv', function(items, options) {
//     return options.fn(items.join(', '));
// });

// hbs.registerHelper('csv', function(items, options) {
//   return items.map(function(item) {
//     return options.fn(item)
//   }).join(', ')
// })

hbs.registerHelper('formatDate', function(date) {
    
  return moment(date).format("MM-DD-YYYY");
});


hbs.registerHelper('commaSeparatedValues', function(list) {
   if(!list || list.length == 0)
    return '';
    
    var returnText =''
    for(var i = 0; i < list.length; i++){
        returnText = returnText + list.name + ",";
    }

    return returnText;
});

hbs.registerHelper('select', function(selected, options) {
    return options.fn(this).replace( new RegExp(' value=\"' + selected + '\"'), 
      '$& selected="selected"').replace( new RegExp('>' + selected + '</option>'), 
      ' selected="selected"$&');
});

hbs.registerHelper('dateFormat', require('handlebars-dateformat'));

hbs.registerHelper("math", function(lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
        
    return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
    }[operator];
});

hbs.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});


mongoose.connect(dbConfig.url);

mongoose.connection.on('connected', function() {
    console.log('Mongoose default connection open to ' + dbURI);
});


mongoose.connection.on('error', function(err) {
    console.log('Mongoose default connection error: ' + err);
});


mongoose.connection.on('disconnected', function() {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    mongoose.connection.close(function() {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(validator()); // !!!! VERY IMP !!!! this line should be just after bodyParser.urlencoded.
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
require('./passport/loginStrategy')(passport);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// START routes for the view layer
var index = require('./routes/index');

 //var expfile = require('./routes/expfile'); 
var createusersetting = require('./routes/createusersetting'); 
var manageaccounts = require('./routes/manageaccounts');
var historical_arpi = require('./routes/historical_arpi');
var historical_platform_arpi = require('./routes/historical_platform_arpi');
var TOS = require('./routes/TOS');
var PrivacyPolicy = require('./routes/PrivacyPolicy');
var contactus = require('./routes/contactus');

var ua_dashboard = require('./routes/ua_dashboard');
var login = require('./routes/login');
var forgot = require('./routes/forgot');
var registration = require('./routes/registration');
var apiLogin = require('./api/login')(passport);
var inviteaccman = require('./api/inviteaccman');
var apigetaccmanagedata = require('./api/getaccmanagedata');
var addgame = require('./api/addgame');
var dltgame = require('./api/dltgame');

var changepwd = require('./api/changepwd');
var getinvitebyemail = require('./api/getinvitebyemail');
var signupapi = require('./api/signup');

var dashboardapifilterdata = require('./api/dashboardapifilterdata');

var dashboardapiGridView = require('./api/dashboardapiGridView');
var dashboardapiChartView = require('./api/dashboardapiChartView');
var alluserdata = require('./api/alluserdata');
var contactsendmail = require('./api/contactsendmail');
var apiRegister = require('./api/register')(passport);
var sendmessage = require('./api/sendemail');
var apiforget = require('./api/forget');
var apiupdatestatus = require('./api/updatestatus');
var apireset = require('./api/resetpassword');
var reporttitlesave = require('./api/reporttitlesave');
var reporttitle = require('./api/reporttitle');
var getreporttitledetail = require('./api/getreporttitledetail');
var usertitle = require('./api/usertitle');
var historicalapiChartView = require('./api/historicalapiChartView');
var historicalapiGridView = require('./api/historicalapiGridView');
var historicalPlatformApiChartView = require('./api/historicalPlatformApiChartView');
var historicalPlatformApiGridView = require('./api/historicalPlatformApiGridView');
//var checkMysqlAPI = require('./api/checkMysqlAPI');
var contactus = require('./routes/contactus');
//app.use("/api/checkMysqlAPI", checkMysqlAPI);
app.use('/', index);
app.use('/index', index);
app.use('/login', index);
app.use('/api/auth', apiLogin);
app.use('/for', apiforget);
app.use('/forgot', forgot);
app.use('/reset', apireset);
app.use('/sendmessage', sendmessage);
app.use('/register', registration);
app.use('/api/signup', signupapi);

// app.use('/expfile', expfile);


//app.use('/historicalarpi', historicalarpi);
var admindata = require('./api/admindata');
var getdbconn = require('./api/getdbconn');

//add user info middleware
app.use(function (req, res, next) {
  utils.loaduserLoggedin(req, res, function(data){
    req.userInfo = data.userInfo;
    req.isAjax = req.xhr;
    res.locals.isUserLoggedIn = data.userInfo.isUserLoggedIn;
    next(); // pass control to the next handler
  });
});


var exemtpted4mAuthUrls = "/login /forgot /api/signup /api/contactsendmail /for /sendmessage ";


//all api request should be user logged in
app.use(function (req, res, next) {
if(exemtpted4mAuthUrls.indexOf(req.url) >= 0){
    next();
    return;
  }
else{
    if(!req.userInfo.isUserLoggedIn){
        //console.log("req.userInfo.isUserLoggedIn- ", req.userInfo.isUserLoggedIn)
       res.redirect("/");
      }else{
        next();
        return;
      }
    }
});





app.use('/admindata', admindata);

app.use('/createusersetting', createusersetting);
app.use('/manageaccounts', manageaccounts);
app.use('/historical_source_arpi', historical_arpi);
app.use('/historical_platform_arpi',historical_platform_arpi);
app.use('/tos', TOS);
app.use('/privacy-policy', PrivacyPolicy);
app.use('/contact-us', contactus);
app.use('/ua_dashboard', ua_dashboard);
app.use('/getaccmanagedata', apigetaccmanagedata);
app.use('/getinvitebyemail', getinvitebyemail);
app.use('/inviteaccman', inviteaccman);
app.use('/alluserdata', alluserdata);
app.use('/api/contactsendmail', contactsendmail);
app.use('/updatestatus', apiupdatestatus);

app.use('/api/addgame', addgame);
app.use('/api/dltgame', dltgame);
app.use('/api/reg', apiRegister);
app.use('/api/changepwd',changepwd);
app.use('/api/reporttitlesave', reporttitlesave);
app.use('/api/dashboardapifilterdata', dashboardapifilterdata);

app.use('/api/dashboardapiGridView', dashboardapiGridView);
app.use('/api/dashboardapiChartView', dashboardapiChartView);

app.use('/api/reporttitle', reporttitle);
app.use('/api/getreporttitledetail', getreporttitledetail);
app.use('/api/usertitle', usertitle);
app.use('/api/historicalapiChartView', historicalapiChartView);
app.use('/api/historicalapiGridView', historicalapiGridView);
app.use('/api/historicalPlatformApiChartView', historicalPlatformApiChartView);
app.use('/api/historicalPlatformApiGridView', historicalPlatformApiGridView);
app.use('/api/getdbconn', getdbconn);
app.use('/contact-us', contactus);
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
module.exports = app;
