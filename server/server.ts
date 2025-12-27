import { app } from './app';
import dotenv from 'dotenv';
import { connectDB } from './utils/db';

dotenv.config(); // Load environment variables from .env file

const PORT = process.env.PORT || 3000;
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
