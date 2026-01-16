const mongooose = require('mongoose');

const sectionSchema = new mongooose.Schema({
    sectionName: {
        type: String,
    },
    subSections: [
        {
            type: mongooose.Schema.Types.ObjectId,
            required: true,
            ref: "SubSection",
        }
    ],
});

module.exports = mongooose.model("Section", sectionSchema);