const express = require("express");
const { userAuth } = require("../middleware/auth");
const requestRouter = express.Router();
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        res.status(400).json({ message: "Invalid Status" + status });
      }
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({ message: "User not found" });
      }
      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingRequest) {
        return res.status(400).json({ message: "Request already sent" });
      }
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();
      res.json({
        message:
          req.user.firstName +
          " is being " +
          status +
          " in " +
          toUser.firstName,
        data,
      });
    } catch (err) {
      res.status(400).send("Error:" + err.message);
    }
  }
);
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid Status" + status });
      }
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res.status(400).json({ message: "No request found" });
      }
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.json({
        message: "Request reviewed successfully" + status,
        data,
      });
    } catch (err) {
      res.status(400).send("Error:" + err.message);
    }
  }
);
module.exports = requestRouter;
