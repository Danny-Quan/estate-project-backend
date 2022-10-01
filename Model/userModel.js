const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "a user must have a username"],
      trim: [true],
    },
    contact1: {
      type: Number,
      unique: [true, 'phone number already exist'],
      required: [true, "a user must have a contact"],
    },
       contact2: {
      type: Number,
      unique: [true, 'phone number already exist'],
      required: [true, "a user must have a contact"],
    },
    role: {
      type: String,
      default: "agent",
      enum: ["admin", "agent"],
    },
    userPhoto: {
      type: String,
      default: "default.jpg",
    },
    email: {
      type: String,
      required: [true, "a user must have an email"],
      unique: [true, "this email already exist"],
      validate: [validator.isEmail, "please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "a user must have a password"],
      minLength: [6, "a password must have at least 6 characters"],
      validate: {
        validator: function (val) {
          if (val.includes("password")) {
            throw new Error("password cannot contain the wordl 'password'");
          }
        },
      },
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "confirm your password"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "passwords does not match",
      },
    },
    emailVerified: {
      type: Boolean,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});
userSchema.methods.correctPassword = async function (
  currentPassword,
  password
) {
  return await bcrypt.compare(currentPassword, password);
};
userSchema.methods.createPasswordResetToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  this.passwordResetExpiry = new Date(Date.now() + 10 * 60 * 1000);
  //console.log(verificationToken, this.passwordResetToken)
  return verificationToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
