const express = require("express");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const { userAuth } = require("../middleware/auth");
const {
  validateEditProfileData,
  validatedPassword,
} = require("../utils/validation");
profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    // const cookies = req.cookies;
    // const { token } = cookies;
    // console.log(token);
    // if (!token) {
    //   throw new Error("Invalid Token");
    // }
    // const decoded = await jwt.verify(token, "secret");
    // const { _id } = decoded;
    // const user = await User.findById(_id);
    // console.log(user);
    // if (!user) {
    //   throw new Error("User not found");
    // }
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit updates");
    }
    const LoggedInUser = req.user;
    Object.keys(req.body).forEach((k) => (LoggedInUser[k] = req.body[k]));
    await LoggedInUser.save();
    res.json({
      message: `${LoggedInUser.firstName}, your profile updated successfully`,
      data: LoggedInUser,
    });
  } catch (err) {
    res.status(400).send("Something went wrong" + err.message);
  }
});
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const LoggedInUser = req.user;
    const newPassword = req.body.password;
    const isSamePassword = await LoggedInUser.validatePassword(newPassword);
    if (isSamePassword) {
      throw new Error("New password cannot be the same as the old password");
    }
    if (!validatedPassword(req)) {
      throw new Error("Invalid Password");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    LoggedInUser.password = hashedPassword;
    await LoggedInUser.save();
    res.send("Password updated successfully");
  } catch (err) {
    res.status(400).send("Something went wrong" + err.message);
  }
});
module.exports = profileRouter;
