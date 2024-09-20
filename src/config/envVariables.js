import dotenv from 'dotenv';

dotenv.config();

const envVariables = {
  CLIENT_URL: process.env.CLIENT_URL,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  MAILTRAP_TOKEN: process.env.MAILTRAP_TOKEN,
  MAILTRAP_SENDER_EMAIL: process.env.MAILTRAP_SENDER_EMAIL,
};

export default envVariables;
