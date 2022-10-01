const express = require("express");
const helmet = require("helmet");
const xss = require("xss");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authController = require("./Controller/authController");
const errorController = require("./Controller/errorController");
const app = express();

const userRoutes = require("./Routes/userRoutes");
const apartmentRoutes = require("./Routes/apartmentRoutes");

app.use("/public", express.static("public"));
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(
  // https://estate-project-frontend.netlify.app
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

// app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/apartments", apartmentRoutes);
// error handling middleware here
app.use(errorController);
module.exports = app;
