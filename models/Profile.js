const mongooose = require('mongoose');
const profileSchema = new mongooose.Schema({
    gender : {
        type: String,
    },
    dateOfBirth : {
        type: Date,
        //type: String,
    },
    about : {
        type: String,
        trim: true,
    },
    contactNumber : {
        type: String,
        trim: true,
    },

});

module.exports = mongooose.model("Profile", profileSchema); 