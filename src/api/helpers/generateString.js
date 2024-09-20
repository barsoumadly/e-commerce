import crypto from 'crypto';

const generateString = function () {
  return crypto.randomBytes(32).toString('hex');
};

export default generateString;
