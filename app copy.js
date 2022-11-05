require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./model/user");
const Form = require("./model/form");
const auth = require("./middleware/auth");

const app = express();

app.use(express.json({ limit: "50mb" }));

// USER Routes ===================================================================
app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { name, email, password } = req.body;

    // Validate user input
    if (!(email && password && name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      role: 'USER',
      isIndividualAccount: true,
      isCompanyAccount: false,
      paymentVerified: false,
      submittedFormsIDs: [],
      createdFormsIDs: []
    });

    // Create token
    const token = jwt.sign(
      { userId: user._id, email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
    // res.send({ data: user });
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { userId: user._id, email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

app.get("/get-profile", auth, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findOne({ _id: decoded.userId });
  res.status(200).json(user);
});


// FORM Routes ===================================================================
app.post("/create-form", auth, async (req, res) => {
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

app.patch("/change-form-privacy", auth, async (req, res) => {
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

app.get("/get-all-my-forms", auth, async (req, res) => {
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

app.delete("/delete-form", auth, async (req, res) => {
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

// Other Routes ===================================================================
app.get("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});


// Handle Undefined Routes ========================================================
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

module.exports = app;