const mongooose = require('mongoose');

const tagSchema = new mongooose.Schema({
    name: {
        type: String,
        required: true,
    },
    description:{
        type: String,
    },
    course:{
        type: mongooose.Schema.Types.ObjectId,
        ref: "Course",
    },
});
    
module.exports = mongooose.model("Tag", tagSchema);