require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const cors = require("cors");

const AuthRoute = require('./routes/Auth.route');
const FormRoute = require('./routes/Form.route');
const PublicRoute = require('./routes/Public.route');

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cors());

// Main Routes
app.use('/auth', AuthRoute);
app.use('/form', FormRoute);
app.use('/public', PublicRoute);

// Undefined Routes
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