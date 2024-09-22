import User from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import hashCode from '../helpers/hashCode.js';
import envVariables from '../../config/envVariables.js';
import createAndSendToken from '../helpers/createAndSendToken.js';
import {
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordSuccessEmail,
} from '../mails/sendEmails.js';

const signup = async function (request, response) {
  const { name, email, password, passwordConfirm } = request.body;

  try {
    if (!name || !email || !password || !passwordConfirm) {
      throw new AppError(
        'Please enter your name, email, password and confirm password',
        400
      );
    }

    const user = await User.findOne({ email });
    if (user) {
      throw new AppError(
        'This email already exist. Try to use another one',
        400
      );
    }

    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm,
    });
    const verificationCode = newUser.generateVerificationCode();
    await sendVerificationEmail(newUser.email, verificationCode);
    await newUser.save({ validateBeforeSave: false });

    response.status(200).json({
      status: 'success',
      data: {
        user: {
          ...newUser._doc,
          password: undefined,
          passwordList: undefined,
        },
      },
    });
  } catch (error) {
    response.status(error.statusCode || 500).json({
      status: error.status || 'error',
      message: error.message,
    });
  }
};

const verifyEmail = async function (request, response) {
  const { verificationCode } = request.body;

  try {
    if (!verificationCode) {
      throw new AppError('Please enter verification code', 400);
    }

    const user = await User.findOne({
      verificationCode: hashCode(verificationCode),
      verificationExpiresIn: { $gt: Date.now() },
    });
    if (!user) {
      throw new AppError('Verification code is invalid or has expired', 400);
    }

    user.verificationCode = undefined;
    user.verificationExpiresIn = undefined;
    user.isVerified = true;
    await sendWelcomeEmail(user.email, user.name);
    await user.save({ validateBeforeSave: false });
    createAndSendToken(user.id, response);

    response.status(200).json({
      status: 'success',
      message: 'Email is verified successfully',
    });
  } catch (error) {
    response.status(error.statusCode || 500).json({
      status: error.status || 'error',
      message: error.message,
    });
  }
};

const login = async function (request, response) {
  const { email, password } = request.body;

  try {
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    const user = await User.findOne({ email });
    const isValidPassword = await user?.comparePasswords(password);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    createAndSendToken(user.id, response);
    response.status(200).json({
      status: 'success',
      data: {
        user: {
          ...user._doc,
          password: undefined,
          passwordList: undefined,
        },
      },
    });
  } catch (error) {
    response.status(error.statusCode || 500).json({
      status: error.status || 'error',
      message: error.message,
    });
  }
};

const logout = async function (request, response) {
  response.clearCookie('jwt');
  response.status(200).json({
    status: 'success',
    message: 'User is logged out successfully',
  });
};

const forgotPassword = async function (request, response) {
  const { email } = request.body;

  try {
    if (!email) {
      throw new AppError('Please provide your email.', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('This email does not exist.', 404);
    }

    const token = user.generateResetPasswordToken();
    const resetURL = `${envVariables.CLIENT_URL}/reset-password/${token}`;
    await sendResetPasswordEmail(user.email, resetURL);
    await user.save({ validateBeforeSave: false });

    response.status(200).json({
      status: 'success',
      message: 'Please check your email',
    });
  } catch (error) {
    response.status(error.statusCode || 500).json({
      status: error.status || 'error',
      message: error.message,
    });
  }
};

const resetPassword = async function (request, response) {
  const { token } = request.params;
  const { newPassword, newPasswordConfirm } = request.body;

  try {
    if (!newPassword || !newPasswordConfirm) {
      throw new AppError('Please provide password and confirm it.', 400);
    }

    const user = await User.findOne({
      resetPasswordToken: hashCode(token),
      resetPasswordExpiresIn: { $gt: Date.now() },
    });
    if (!user) {
      throw new AppError('Token is invalid or has expired.', 400);
    }

    const isValidPassword = await user.checkPasswordList(newPassword);
    if (!isValidPassword) {
      throw new AppError(
        'You used this password before. Please use another one.',
        400
      );
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresIn = undefined;
    await sendResetPasswordSuccessEmail(user.email);
    await user.save();

    response.status(200).json({
      status: 'success',
      message: 'Your reset password successfully. Please check your email.',
    });
  } catch (error) {
    response.status(error.statusCode || 500).json({
      status: error.status || 'error',
      message: error.message,
    });
  }
};

export { signup, verifyEmail, login, logout, forgotPassword, resetPassword };
