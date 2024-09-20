const generateCode = function () {
  return Math.floor(
    Math.pow(Math.random(), Math.random()) * 900000 + 100000
  ).toString();
};

export default generateCode;
