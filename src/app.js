const express = require("express");
const app = express();
app.use("/", (req, res) => {
  res.send("Hello World");
});
app.use("/home", (req, res) => {
  res.send("Hello World");
});
app.use("/about", (req, res) => {
  res.send("About Page");
});
app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
