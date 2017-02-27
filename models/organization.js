var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var organizationSchema = new Schema({
    
    name:{
        type:String
    },
    dbConnectionString:{
        type:String
    }
  
},{
  collection: 'organizations'
});

var Organization = mongoose.model('organization', organizationSchema,'organizations');

// make this available to our users in our Node applications
exports.organizationModel = Organization;

    