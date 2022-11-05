const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    privacy: {
        type: String,
        required: true,
        default: 'RESTRICTED'
    },
    totalSubmissions: {
        type: Number,
        default: 0,
    },
    type: {
        type: String,
        default: 'SIMPLE', // Simple | Survey | Quiz
    },
    // role: {
    //     type: String,
    //     default: 'ADMIN', // Admin |User | Sub-Admin
    // },
    doNotExpire: {
        type: Boolean,
        default: false,
    },
    expiryDate: {
        type: Date,
    },
    questionnaire: {
        type: Array,
        required: true,
    },
    answers: {
        type: Array,
        default: []
    },
    results: {
        type: Array,
        default: []
    },
    allowAnonymousSubmission: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    // role: {
    //     type: String,
    //     default: 'USER',
    // },
}, { timestamps: true });

module.exports = mongoose.model("form", formSchema);