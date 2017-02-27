var devConfig = {
'hash': 'technicalexpertslabforaloglift',
'expiresInSecs': 8640000,
'cacheTTL': 8640000,
'checkPeriod': 8640000,
'codes': {
'UNAUTHORIZED': 401,
'OK': 200,
'BAD_REQUEST': 400,
'INTERNAL_SERVER_ERROR': 500,
'GATEWAYTIMEOUT':504,
'DUPLICATE':409,
'FORBIDDEN': 403,
'NOTIMPLEMENTED' : 501
},
'site': 'http://algolift.beedev.net',
'pageIndex_default': 1,
'pageSize_default': 10,
'offset_default': 25,
'sending': {
'user': 'faraz_algolift',
'key': 'hT8NUhw8.[h]cUV:',
'api': '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'
},
'contactusemail': 'contact@algolift.com',
'adminemail': 'support@algolift.com',
'fromemail': 'support@algolift.com',
'LOG_FILE_PATH' : '/var/logs/algolift/',
'user_encrypted_cookie_name' : 'authuser_1',
'loaclapath': "localhost:3000"
};


var productionConfig = {
'hash': 'technicalexpertslabforaloglift',
'expiresInSecs': 8640000,
'cacheTTL': 8640000,
'checkPeriod': 8640000,
'codes': {
'UNAUTHORIZED': 401,
'OK': 200,
'BAD_REQUEST': 400,
'INTERNAL_SERVER_ERROR': 500,
'GATEWAYTIMEOUT':504,
'DUPLICATE':409,
'FORBIDDEN': 403,
'NOTIMPLEMENTED' : 501
},
'site': 'http://portal.algolift.com',
'pageIndex_default': 1,
'pageSize_default': 10,
'offset_default': 25,
'sending': {
'user': 'faraz_algolift',
'key': 'hT8NUhw8.[h]cUV:',
'api': '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'
},
'contactusemail': 'contact@algolift.com',
'adminemail': 'support@algolift.com',
'fromemail': 'support@algolift.com',
'LOG_FILE_PATH' : '/var/logs/algolift/',
'user_encrypted_cookie_name' : 'authuser_1',
'loaclapath': "localhost:3000"
};


module.exports = (process.env.NODE_ENV || 'development') === 'prod' ? productionConfig : devConfig;