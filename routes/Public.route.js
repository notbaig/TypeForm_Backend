const express = require('express');
const router = express.Router();
const Form = require("../model/form");
const Submission = require("../model/submission");

router.post("/get-form", async (req, res) => {
    const { formId } = req.body;
    const form = await Form.findOne({ _id: formId });
    res.status(200).json(form);
});

router.post("/submit-form", async (req, res) => {
    await Form.findOneAndUpdate({ _id: req.body.formId }, { $inc: { 'totalSubmissions': 1 } });
    const submission = await Submission.create({
        ...req.body
    });
    res.status(200).json(submission);
});

module.exports = router;