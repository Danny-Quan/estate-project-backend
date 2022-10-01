const User = require("./../Model/userModel");
const AppError = require("./../utils/appError");
const JWT = require("jsonwebtoken");
const multer = require("multer");

// upload user photo
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/users");
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split("/")[1];
    cb(
      null,
      `user-${Date.now()}-${Math.round(Math.random() * 1000)}.${extension}`
    );
  },
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("please select an image file"), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadPhoto = upload.single("userPhoto");

exports.updateUser = async (req, res, next) => {
  try {
    if (req.body.email || req.body.password)
      return next(new AppError("can't update email and password here"));
    console.log(req.body);
    const filterObj = {
      username: req.body.username,
      contact1: req.body.contact1,
      contact2: req.body.contact2,
    };
    if (req.file) {
      filterObj.userPhoto = req.file.filename;
    }
    const updatedUser = await User.findByIdAndUpdate(res.user.id, filterObj, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) return next(new AppError("user not found", 404));
    res.status(200).json({
      status: "success",
      updatedUser,
    });
  } catch (error) {
    // res.status(404).json({
    //   message: error.message,
    // });
    next(error);
  }
};
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users) return next(new AppError("user not found", 404));
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    // res.status(404).send({
    //   message: error.message,
    // });
    next(error);
  }
};
exports.deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return next(new AppError("user not found", 404));
    res.status(203).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    // res.status(404).send({
    //   message: error.message,
    // });
    next(error);
  }
};
