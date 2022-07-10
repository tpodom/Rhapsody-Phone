const { nanoid } = require("nanoid");

exports.generateId = () => {
  return nanoid();
};
