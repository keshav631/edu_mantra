const mongooose = require('mongoose');


const courseSchema = new mongooose.Schema({
    courseName: {
        type: String,
    },
    courseDescription: {
        type: String,
    },
    instructor: {
        type: mongooose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    whatYouWillLearn: {
        type: String,
    },
    courseContent: [
        {
            type: mongooose.Schema.Types.ObjectId,
            ref: "Section",
        }
    ],

    price: {
        type: Number,
    },

    ratingsAndReviews: [
        {
            type: mongooose.Schema.Types.ObjectId,
            ref: "RatingAndReview",
        }
    ],

    thumbnail: {
        type: String,
    },
    tag:{
        type: mongooose.Schema.Types.ObjectId,
        ref: "Tag",
    },
    studentsEnrolled: [
        {
            type: mongooose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    ],
});

module.exports = mongooose.model("Course", courseSchema);