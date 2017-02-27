var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var roleSchema = new Schema({
    
    name: {
        type:String
    }
  
},{
  collection: 'roles'
});

var Role = mongoose.model('role', roleSchema, 'roles');

// make this available to our users in our Node applications
exports.roleModel = Role;

    