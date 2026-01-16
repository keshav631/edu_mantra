//const  = require('express');
const mongooose = require('mongoose');

const userSchema = new mongooose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        //unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        //trim: true,
    },
    accountType: {
        type: String,
        enum: ['Student', 'Instructor', 'Admin'],
        required: true,
    },
    additionalDetails: {
        type: mongooose.Schema.Types.ObjectId,
        required: true,
        ref:"Profile",
    },
    courses:[
        {
        type: mongooose.Schema.Types.ObjectId,
        ref: "Course",
        }
    ],
    image: {
        type: String,
        required: true,
    },
    courseProgress: [
        {
        type: mongooose.Schema.Types.ObjectId,
        ref: "CourseProgress",
        }
    ],

});

module.exports = mongooose.model("User", userSchema);