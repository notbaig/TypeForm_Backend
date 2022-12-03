const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

const Submission = require("../model/submission");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
    try {
        const formSubmissions = await Submission.find({ formId: req.body.formId });
        res.status(200).json({
            success: true,
            submissions: formSubmissions
        });
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;