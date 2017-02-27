var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var inviteSchema = new Schema({
    invitationDate: {
        type:String
    },
    inviteToken: {
        type:String
    },
    tokenExpiryDate: {
        type:String
    },
    sentBy: {
        firstName:{
            type:String
        },
        lastName:{
            type:String
        },
        email:{
            type:String
        }
    },
    sendTo: {
        email:{
            type:String
        },
        organization:{
            type:String
        },
        titles: [
            {
                name:{
                    type:String
                }
            }
        ],
        role:{
            type:String
        }
    },
    status:{
        type:String
    }
}, {
  collection: 'invitations'
});

var Invite = mongoose.model('invitation', inviteSchema, 'invitations');

exports.invitationModel = Invite;
