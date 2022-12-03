const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    formId: {
        type: String,
        required: true,
    },
    questionnaire: {
        type: Array,
        required: true,
    },
    answers: {
        type: Array,
        required: true,
    },
    submittedBy: {
        type: String,
        default: 'ANONYMOUS'
    }
}, { timestamps: true });

module.exports = mongoose.model("submission", submissionSchema);