import { connectDB } from './config/database.config';
import { app } from './app';
import { validateEnv, loadedEnvFile } from './utils/env.utils';

validateEnv();
connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT} in ${process.env.NODE_ENV || 'development'} mode (using ${loadedEnvFile})`);
});