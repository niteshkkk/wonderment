var winston = require('winston');
var config = require('../config');
winston.emitErrs = true;

var serviceLogger = new winston.Logger({
	transports : [ new winston.transports.File({
		level : 'info',
		filename : config.LOG_FILE_PATH + 'algolift-service.log',   // for windows

		handleExceptions : true,
		json : true,
		maxsize : 1024 * 1024 * 10 , // 10MB
		maxFiles : 5555555,
		colorize : false
	}), new winston.transports.Console({
		level : 'debug',
		handleExceptions : true,
		json : false,
		colorize : true
	}) ],
	exitOnError : false
});

var appLogger = new winston.Logger({
	transports : [ new winston.transports.File({
		level : 'info',
		filename : config.LOG_FILE_PATH + 'algolift-app.log',   // for windows
		handleExceptions : true,
		json : false,
		maxsize : 1024 * 1024 * 10 , // 10MB
		maxFiles : 5555555,
		colorize : true
	}), new winston.transports.Console({
		level : 'error',
		handleExcepions : true,
		json : false,
		colorize : true
	}) ],
	exitOnError : false
});





exports.stream = {
	write : function(message, encoding) {
		logger.info(message);
	}
};

exports.serviceLogger = serviceLogger;
exports.appLogger = appLogger;
