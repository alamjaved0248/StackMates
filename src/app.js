const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middleware/auth");
app.use(express.json());
app.use(cookieParser());
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
app.use(authRouter);
app.use(profileRouter);
app.use(requestRouter);
app.use(userRouter);

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

app.get("/user", async (req, res) => {
  try {
    const user = await User.findOne({ emailId: req.body.emailId });
    if (!user) {
      return res.status(400).send("User not found");
    }
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});
app.get("/feed", async (req, res) => {
  const users = await User.find();
  res.send(users);
});
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;

  try {
    const users = await User.findByIdAndDelete(userId);
    res.send("User deleted Successfully");
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});
// patch user API - updating the data of user
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    const Allowed_Updates = [
      "photoURL",
      "about",
      "gender",
      "skills",
      "firstName",
      "lastName",
      "age",
    ];
    const isValidOperation = Object.keys(data).every((k) =>
      Allowed_Updates.includes(k)
    );
    if (!isValidOperation) {
      return res.status(400).send("Invalid updates");
    }
    if (data?.skills.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }
    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "before",
      runValidators: true,
    });
    console.log(user);
    res.send("User updated successfully");
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});
connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(4000, () => {
      console.log("Server is running on port 4000");
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });
