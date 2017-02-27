//define schema
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var loginDetail = new Schema({
      username: String,
      password: String
    }, {
      collection: 'loginInfo'
    });

var loginDetails = mongoose.model('loginInfo', loginDetail);

module.exports = loginDetails;