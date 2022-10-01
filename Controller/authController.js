const User = require("./../Model/userModel");
const JWT = require("jsonwebtoken");
const util = require("util");
const sendEmail = require("./../utils/sendEmail");
const crypto = require("crypto");
const AppError = require("./../utils/appError");

const createToken = (user) => {
  return JWT.sign({ id: user._id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};
const createTokenAndCookie = (res, user, statusCode) => {
  const token = createToken(user);
  res.cookie("estateProject", token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRATION * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(statusCode).json({
    status: "success",
    user,
    token,
  });
};
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new AppError("please enter an email or password", 401));
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(
        new AppError("please provide a valid email or password", 401)
      );
    }
    // const token = createToken(user);
    // res.status(200).json({
    //   status: "success",
    //   user,
    //   token,
    // });
    createTokenAndCookie(res, user, 200);
  } catch (error) {
    // res.status(401).send({
    //   message: error.message,
    // });
    next(error);
  }
};

exports.logout = (req, res) => {
  res.clearCookie("estateProject");
  res.send("logged out successfully!");
};
exports.signUp = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    if (!user)
      return next(new AppError("there was a problem creating user", 400));

    createTokenAndCookie(res, user, 200);
  } catch (error) {
    // res.status(400).send({
    //   message: error.message,
    // });
    next(error);
  }
};

exports.protected = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies) {
      token = req.cookies.estateProject;
      //console.log(token);
    }
    if (!token)
      return next(
        new AppError("you are not allowed to access this route", 401)
      );
    const decode = await util.promisify(JWT.verify)(
      token,
      process.env.JWT_PRIVATE_KEY
    );
    console.log(decode);
    const currentUser = await User.findById(decode.id);
    if (!currentUser)
      return next(
        new AppError("user is logged out. try logging in again", 401)
      );

    res.user = currentUser;
    return next();
  } catch (error) {
    // res.status(401).send({
    //   status: "failed",
    // });
    next(error);
  }
};
exports.findMe = async (req, res, next) => {
  try {
    const user = await User.findById(res.user.id);
    if (!user) return next(new AppError("user are not allowed", 401));
    res.status(200).send({
      isLoggedIn: true,
      user,
    });
  } catch (error) {
    // res.status(401).send({
    //   message: error.message,
    // });
    next(error);
  }
};
//password reset
exports.forgotPassword = async (req, res, next) => {
  // 1) get user based on the POSTed email
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError("user with this email not found", 500));
    }
    // 2) generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // 3) send it to the user's email
    //console.log(resetURL)

    const resetURL = `https://estate-project-frontend.netlify.app/reset-password/${resetToken}`;
    const message = `<p>Hi there, <br><br>please reset password for <b>${user.username}</b> by clicking this link within 10 minutes:<br><br> <a href='${resetURL}'>Click here to reset your password </a> <br><br> you requested for password reset. please ignore this message if your did not perform this action <br><br>Thanks!</p>`;
    // await new Email(user, resetURL).sendPasswordReset();
    await sendEmail({
      email: user.email,
      subject: "your password reset token. valid for 10 min",
      message: "reset password",
      html: message,
    });

    res.status(200).json({
      status: "success",
      message: "reset token sent to your email",
    });
  } catch (err) {
    // res.status(500).send({
    //   message: err.message,
    // });
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  // 1) get user based on the token
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: Date.now() },
    });
    // 2) if token was not expired and there is user, save the new password
    if (!user) {
      return next(new AppError("Token is invalid or has expired", 500));
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    createTokenAndCookie(res, user, 201);
  } catch (err) {
    // res.status(500).send({
    //   status: "failed",
    //   message: err.message,
    // });
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(res.user.id).select("+password");
    if (!user)
      return next(new AppError("please login to complete this action", 401));
    if (!(await user.correctPassword(req.body.password, user.password))) {
      return next(new AppError("please enter a correct password", 401));
    }
    user.password = req.body.newPassword;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    createTokenAndCookie(res, user, 200);
  } catch (err) {
    // res.status(401).send({
    //   status: "failed",
    //   message: err.message,
    // });
    next(err);
  }
};
