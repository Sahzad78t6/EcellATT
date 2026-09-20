import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecell_attendance',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_key_change_in_production_1234567890',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  TIMEZONE: process.env.TIMEZONE || 'Asia/Kolkata',

  ADMIN_NAME: process.env.ADMIN_NAME || 'Super Admin',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@ecell.org',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@12345',
  ADMIN_MEMBER_ID: process.env.ADMIN_MEMBER_ID || 'ADMIN001',

  EMAIL_ENABLED: process.env.EMAIL_ENABLED === 'true',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  MAIL_FROM: process.env.MAIL_FROM || '"E-Cell Attendance" <no-reply@ecell.org>',
  PORTAL_URL: process.env.PORTAL_URL || 'http://localhost:5173'
};
