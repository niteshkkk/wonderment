var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var passportLocalMongoose = require('passport-local-mongoose');

// create a schema
var userSchema = new Schema({
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    phone:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    role:{
        type:String
    },
    organization:{
        type:String
    },
    titles:[
        {
            name:{
                type:String
            }
        }
    ],
    status:{
        type:String
    },
    registrationDate:{
        type: Date
    },
    canInvite:{
        type:Boolean
    },
    totalAllowedInvites:{
        type:Number
    },
    totalInvited:{
        type:Number
    },
    invitedBy:{
        firstName:{
            type:String
        },
        lastName:{
            type:String
        },
        email:{
            type:String
        }
    }
}, {
  collection: 'users'
});


userSchema.plugin(passportLocalMongoose, {usernameField: "email"});

var User = mongoose.model('user', userSchema,'users');

// make this available to our users in our Node applications
exports.userModel = User;
