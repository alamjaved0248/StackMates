const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://jajd248:javed248@cluster1.fjrr1lz.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
