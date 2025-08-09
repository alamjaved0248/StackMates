const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
userRouter.get("/user/request/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate(
      "fromUserId",
      "firstName lastName photoURL about skills age gender"
    );
    res.json({
      message: "Connection requests recieved",
      data: connectionRequest,
    });
  } catch (err) {
    res.status(400).json({ message: "Error" + err.message });
  }
});
const USER_SAFE_DATA = "firstName lastName photoURL about skills age gender";
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);
    const data = connectionRequest.map((item) => {
      if (item.fromUserId._id.equals(loggedInUser._id)) {
        return item.toUserId;
      } else {
        return item.fromUserId;
      }
    });
    res.json({
      message: "Connections",
      data: data,
    });
  } catch (err) {
    res.status(400).json({ message: "Error" + err.message });
  }
});
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;
    const connectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");
    const hideUserIds = new Set();
    connectionRequest.forEach((item) => {
      hideUserIds.add(item.fromUserId.toString());
      hideUserIds.add(item.toUserId.toString());
    });
    const data = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserIds) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      // .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);
    res.json({
      message: "Feed",
      data: data,
    });
  } catch (err) {
    res.status(400).json({ message: "Error" + err.message });
  }
});

module.exports = userRouter;
