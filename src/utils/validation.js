const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("First name and last name are required");
  }
  if (!emailId || !validator.isEmail(emailId)) {
    throw new Error("Invalid email");
  }
  if (!password || !validator.isStrongPassword(password)) {
    throw new Error("Password is not strong");
  }
};
const validateEditProfileData = (req) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "emailId",
    "skills",
    "age",
    "gender",
    "about",
    "photoURL",
  ];
  const allowedChanges = Object.keys(req.body).every((k) =>
    allowedFields.includes(k)
  );
  return allowedChanges;
};
const validatedPassword = (req) => {
  const { password } = req.body;
  if (!password || !validator.isStrongPassword(password)) {
    throw new Error("Password is not strong");
  }
  const allowedFields = ["password"];
  const allowedChanges = Object.keys(req.body).every((k) =>
    allowedFields.includes(k)
  );
  return allowedChanges;
};
module.exports = {
  validateSignUpData,
  validateEditProfileData,
  validatedPassword,
};
