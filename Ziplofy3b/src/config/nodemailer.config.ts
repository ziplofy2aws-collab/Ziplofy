import nodemailer from 'nodemailer';
// Env is loaded by env.utils (imported first in index.ts)
import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.DOTENV_CONFIG_PATH
  ?? `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Gmail App Passwords often have spaces when copied - remove them
const emailUser = process.env.EMAIL_ADDRESS?.trim();
const emailPass = (process.env.EMAIL_PASSWORD ?? '').replace(/\s/g, '');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// Verify connection configuration
transporter.verify(function (error: Error | null, success?: boolean) {
  if (error) {
    console.error('Nodemailer configuration error:', error.message);
    if (error.message?.includes('Invalid login')) {
      console.error(
        'Gmail tip: Use an App Password (not your regular password). ' +
        'Go to Google Account > Security > 2-Step Verification > App passwords'
      );
    }
  } else {
    console.log('Nodemailer is ready to send emails');
  }
});

export default transporter;
