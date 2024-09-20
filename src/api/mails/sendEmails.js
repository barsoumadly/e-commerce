import envVariables from '../../config/envVariables.js';
import AppError from '../utils/AppError.js';
import { client, sender } from './emailConfig.js';
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from './emailTemplates.js';

const sendVerificationEmail = async function (userEmail, verificationCode) {
  const recipients = [{ email: userEmail }];

  try {
    await client.send({
      from: sender,
      to: recipients,
      subject: 'Verify your email',
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        '{verificationCode}',
        verificationCode
      ),
      category: 'Verification Email',
    });
  } catch (error) {
    throw new AppError(`Failed to send email as ${error}`, 500);
  }
};

const sendWelcomeEmail = async function (userEmail, name) {
  const recipients = [{ email: userEmail }];

  try {
    await client.send({
      from: sender,
      to: recipients,
      template_uuid: envVariables.MAILTRAP_TEMPLATE_ID,
      template_variables: {
        company_info_name: 'Shop Sphere',
        name,
      },
    });
  } catch (error) {
    throw new AppError(`Failed to send email ${error}`, 500);
  }
};

const sendResetPasswordEmail = async function (userEmail, resetURL) {
  const recipients = [{ email: userEmail }];

  try {
    await client.send({
      from: sender,
      to: recipients,
      subject: 'Reset your password',
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetURL),
      category: 'Reset Password',
    });
  } catch (error) {
    throw new AppError(`Failed to send email ${error}`, 500);
  }
};

const sendResetPasswordSuccessEmail = async function (userEmail) {
  const recipients = [{ email: userEmail }];

  try {
    await client.send({
      from: sender,
      to: recipients,
      subject: 'Your password is reset successfully',
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: 'Reset Password',
    });
  } catch (error) {
    throw new AppError(`Failed to send email ${error}`, 500);
  }
};

export {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendResetPasswordSuccessEmail,
};
