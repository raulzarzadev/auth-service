const express = require("express");
const morgan = require("morgan");

const cors = require("cors");

const app = express();

//settings
app.set("port", process.env.SIGNUP_PORT || 3015);

//middlewares

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

//routes
app.use("/user", require("./routes/users.routes"));

module.exports = app;
