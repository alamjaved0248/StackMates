const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { validateSignUpData } = require("../utils/validation");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);
    const {
      firstName,
      lastName,
      emailId,
      password,
      skills,
      about,
      age,
      gender,
      photoURL,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      skills,
      about,
      age,
      gender,
      photoURL,
    });
    await user.save();
    res.send("User created successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordCorrect = await user.validatePassword(password);
    if (isPasswordCorrect) {
      //create a  jwt token
      const token = await user.getJWT();
      //set the token in the cookie
      res.cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      res.send("Login successful");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send("Something went wrong" + err.message);
  }
});
authRouter.post("/logout", async (req, res) => {
  try {
    const token = req.cookies.token;
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.send("Logout successful");
  } catch (err) {
    res.status(400).send("Something went wrong" + err.message);
  }
});
module.exports = authRouter;
