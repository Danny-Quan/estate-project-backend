const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");
const authController = require("./Controller/authController");

dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE_CONFIG.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
const localDB = process.env.LOCAL_DATABASE_CONFIG;
mongoose
  .connect(localDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("database connected successfully!");
  });
const server = app.listen(process.env.PORT || 8001, () => {
  console.log(`server connected on port ${process.env.PORT}`);
});
app.get("/", (req, res) => {
  res.send("welcome to the backend");
});
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
process.on("uncaughtException", (err) => {
  console.log("uncaught exception! sut down");
  server.close(() => {
    process.exit(1);
  });
});
