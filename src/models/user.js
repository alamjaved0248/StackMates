const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 50,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password is not strong");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("Invalid gender");
        }
      },
    },
    about: {
      type: String,
      default: "this developer is lazy and not about me",
    },
    skills: {
      type: [String],
      default: ["this is skills"],
    },
    photoURL: {
      type: String,
      default: "https://picsum.photos/200/300",
      //validate(value) {
      //if (!validator.isURL(value)) {
      //  throw new Error("Invalid photoURL");
      //}
      //},
    },
  },
  { timestamps: true }
);

userSchema.methods.validatePassword = async function (passwordFromInputUser) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordCorrect = await bcrypt.compare(
    passwordFromInputUser,
    passwordHash
  );
  return isPasswordCorrect;
};

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "secret", {
    expiresIn: "7d",
  });
  return token;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
