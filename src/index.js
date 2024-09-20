import express from 'express';

import envVariables from './config/envVariables.js';
import connectDatabase from './config/database/connectDatabase.js';
import authRoutes from './api/routes/authRoutes.js';

const app = express();
const port = envVariables.PORT;

app.use(express.json());

app.use('/api/v1/auth', authRoutes);

app.listen(port, async function () {
  try {
    await connectDatabase();
    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.log(error.message);
  }
});
