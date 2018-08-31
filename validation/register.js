const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};
  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.confirm_password = !isEmpty(data.confirm_password)
    ? data.confirm_password
    : "";

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be between 2 and 30 character";
  }
  if (Validator.isEmpty(data.name)) {
    errors.name = "Name is Required ";
  }
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email is Required";
  }
  if (!Validator.isEmail(data.email)) {
    errors.email = "Invalid Email ";
  }
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password is Required";
  }
  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be at least 6 characters";
  }
  if (Validator.isEmpty(data.confirm_password)) {
    errors.confirm_password = "Confirm Password is Required";
  }
  if (!Validator.equals(data.password, data.confirm_password)) {
    errors.confirm_password = "Both Passwords must match";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
