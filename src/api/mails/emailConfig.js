import { MailtrapClient } from 'mailtrap';
import envVariables from '../../config/envVariables.js';

const client = new MailtrapClient({
  token: envVariables.MAILTRAP_TOKEN,
});

const sender = {
  email: envVariables.MAILTRAP_SENDER_EMAIL,
  name: 'Shop Sphere',
};

export { client, sender };
