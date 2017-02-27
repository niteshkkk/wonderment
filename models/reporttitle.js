var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var reporttitleSchema = new Schema({

    reportid: {
        type:String
    },
    reporttitlename: {
        type:String
    },
    cohortstartdate: {
        type: Date
    },
    cohortenddate: {
        type: Date
    },
    platforms:[
       
    ],
    sources: [
        
   ],
    country: {
        type:String
    },
    horizon: {
        type:String
    },
    organiclift: {
        type:Boolean
    },
    email: {
        type:String
    },
    organization: {
        type:String
    },
    title: {
        type:String
    },
    createddate: {
        type:Date
    },
    modifieddate: {
        type:Date
    }
  
},{
  collection: 'reporttitles'
});

var Reporttitle = mongoose.model('reporttitle', reporttitleSchema, 'reporttitles');

// make this available to our users in our Node applications
exports.reporttitleModel = Reporttitle;

    