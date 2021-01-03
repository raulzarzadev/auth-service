const mongoose = require("mongoose");

const URI = process.env.USERS_SERVICE_DB;

mongoose.connect(URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("Signup DB is conected");
});
