const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Object.keys(value).length === 0) ||
  (typeof valus === "string" && value.trim().length === 0);

module.exports = isEmpty;
