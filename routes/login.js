var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/',function(req, res){
	
	var username = req.cookies.authuser;
	res.render('index',{
			"guest":true
		});
});

module.exports = router;
