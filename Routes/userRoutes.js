const express = require("express");
const router = express.Router();
const userController = require("./../Controller/userController");
const authController = require("./../Controller/authController");

router.route("/signUp").post(authController.signUp);
router.route("/loginUser").post(authController.loginUser);
router.route("/me").get(authController.protected);
router.route("/findMe").get(authController.protected, authController.findMe);
router.route("/logout").get(authController.logout);
router.route("/forgot-password").post(authController.forgotPassword);
router.route("/reset-password/:token").post(authController.resetPassword);
router
  .route("/change-password")
  .patch(authController.protected, authController.changePassword);
router
  .route("/updateUser")
  .patch(authController.protected,userController.uploadPhoto, userController.updateUser);
module.exports = router;
