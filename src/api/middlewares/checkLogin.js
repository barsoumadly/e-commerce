import jwt from 'jsonwebtoken';
import envVariables from '../../config/envVariables';
import AppError from '../utils/AppError';

const checkLogin = function (request, response, next) {
  const token = request.cookies.token;

  try {
    if (!token) {
      throw new AppError('Unauthorized as no token is provided', 401);
    }

    const userId = jwt.verify(token, envVariables.JWT_SECRET);
    if (!userId) {
      throw new AppError('Unauthorized as token is invalid', 401);
    }

    request.userId = userId;
    next();
  } catch (error) {
    response.status(error.status || 500).json({
      status: error.status || 'error',
      message: error.message,
    });
  }
};

export default checkLogin;
