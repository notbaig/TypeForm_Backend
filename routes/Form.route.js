const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

const Form = require("../model/form");
const auth = require("../middleware/auth");

router.post("/create", auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // const user = await User.findOne({ _id: decoded.userId });
        const createdBy = decoded.userId;
        const {
            privacy,
            totalSubmissions,
            type,
            doNotExpire,
            expiryDate, // should be in UTC Format
            questionnaire,
            answers,
            allowAnonymousSubmission,
        } = req.body;

        if (questionnaire.length <= 0) {
            return res.status(400).json({
                success: false,
                error: {
                    statusCode: 400,
                    message: "Please send a valid Questionnaire.",
                },
            });
        }
        else if (answers.length <= 0) {
            return res.status(400).json({
                success: false,
                error: {
                    statusCode: 400,
                    message: "Please send a valid list of Answers.",
                },
            });
        }
        else {
            const form = await Form.create({
                ...req.body,
                createdBy,
                results: [],
                isActive: true
            });
            res.status(200).json(form);
        }
    } catch (err) {
        console.log(err);
    }
});

router.patch("/change-privacy", auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const createdBy = decoded.userId;
        const { formId, privacy } = req.body;
        const form = await Form.findById(formId);
        if (form) {
            if (form.createdBy === createdBy) {
                await form.updateOne({ privacy: privacy }, () => {
                    res.status(200).json({
                        success: true,
                        message: `Form privacy changes to ${privacy}`
                    });
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    error: {
                        statusCode: 400,
                        message: "You do not have permission to update this form.",
                    },
                });
            }
        }
        else {
            return res.status(400).json({
                success: false,
                error: {
                    statusCode: 400,
                    message: "This form is not available at the moment.",
                },
            });
        }

    } catch (err) {
        console.log(err);
    }
});

router.get("/my-forms", auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const createdBy = decoded.userId;
        const myForms = await Form.find({ createdBy: createdBy });
        res.status(200).json({
            success: true,
            forms: myForms
        });
    } catch (err) {
        console.log(err);
    }
});

router.delete("/delete", auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const createdBy = decoded.userId;
        const { formId } = req.body;
        const form = await Form.findById(formId);
        if (form) {
            if (form.createdBy === createdBy) {
                await form.deleteOne(() => {
                    res.status(200).json({
                        success: true,
                        message: "The form has been deleted successfully"
                    });
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    error: {
                        statusCode: 400,
                        message: "You do not have permission to delete this form.",
                    },
                });
            }
        }
        else {
            return res.status(400).json({
                success: false,
                error: {
                    statusCode: 400,
                    message: "This form is not available at the moment.",
                },
            });
        }

    } catch (err) {
        console.log(err);
    }
});

module.exports = router;