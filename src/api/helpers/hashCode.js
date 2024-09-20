import crypto from 'crypto';

const hashCode = function (code) {
  return crypto.createHash('sha256').update(code).digest('hex');
};

export default hashCode;
