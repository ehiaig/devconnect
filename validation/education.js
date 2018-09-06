const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateEducationInput(data) {
  let errors = {};

  data.school = !isEmpty(data.school) ? data.school : "";
  data.degree = !isEmpty(data.degree) ? data.degree : "";
  data.field_of_study = !isEmpty(data.field_of_study)
    ? data.field_of_study
    : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  if (Validator.isEmpty(data.school)) {
    errors.school = "School field is Required";
  }
  if (Validator.isEmpty(data.degree)) {
    errors.degree = "Degree is Required";
  }
  if (Validator.isEmpty(data.field_of_study)) {
    errors.field_of_study = "Field of Study is Required";
  }
  if (Validator.isEmpty(data.from)) {
    errors.from = "From date field is Required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
