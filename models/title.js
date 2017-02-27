var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var titleSchema = new Schema({
    organization: {
    name:{
        type:String
    },
    titles:[
        {
            name:{
                type:String
            }
        }
	    ]
	  }
},{
  collection: 'titles'
});


var Title = mongoose.model('title', titleSchema, 'titles');

// make this available to our users in our Node applications
exports.titleModel = Title;
