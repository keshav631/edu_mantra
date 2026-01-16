const mongooose = require('mongoose');


const courseProgressSchema = new mongooose.Schema({
    courseId: {
        type: mongooose.Schema.Types.ObjectId,
        ref: "Course",
    },
    completedVideos: [
        {
            type: mongooose.Schema.Types.ObjectId,
            ref: "SubSection",
        }
    ],

});

module.exports = mongooose.model("CourseProgress", courseProgressSchema);