import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

import generateCode from '../helpers/generateCode.js';
import generateString from '../helpers/generateString.js';
import hashCode from '../helpers/hashCode.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    trim: true,
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    trim: true,
    validate: {
      validator: function (confirmedPassword) {
        return confirmedPassword === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordList: {
    type: [String],
  },
  role: {
    type: String,
    trim: true,
    enum: {
      values: ['customer', 'admin'],
      message: 'User role must only be customer or admin',
    },
    default: 'customer',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
  },
  verificationExpiresIn: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpiresIn: {
    type: Date,
  },
  cartItems: [
    {
      quantity: {
        type: Number,
        default: 1,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
  ],
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();

  this.passwordList = [...this.passwordList, this.password];
  next();
});

userSchema.methods.generateVerificationCode = function () {
  const verificationCode = generateCode();
  this.verificationCode = hashCode(verificationCode);
  this.verificationExpiresIn = Date.now() + 15 * 60 * 1000;
  return verificationCode;
};

userSchema.methods.comparePasswords = async function (candiatePassword) {
  return await bcrypt.compare(candiatePassword, this.password);
};

userSchema.methods.generateResetPasswordToken = function () {
  const token = generateString();
  this.resetPasswordToken = hashCode(token);
  this.resetPasswordExpiresIn = Date.now() + 10 * 60 * 1000;
  return token;
};

userSchema.methods.checkPasswordList = async function (newPassword) {
  if (this.passwordList.length === 3) {
    this.passwordList.shift();
  }

  for (let password of this.passwordList) {
    if (await bcrypt.compare(newPassword, password)) {
      return false;
    }
  }
  return true;
};

const User = mongoose.model('User', userSchema);
export default User;
