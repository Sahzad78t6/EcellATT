import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    if (ENV.EMAIL_ENABLED && ENV.SMTP_HOST && ENV.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        secure: ENV.SMTP_SECURE,
        auth: {
          user: ENV.SMTP_USER,
          pass: ENV.SMTP_PASS
        }
      });
      console.log('[EmailService] SMTP Transporter initialized.');
    } else {
      console.log('[EmailService] EMAIL_ENABLED is false or SMTP not configured. Running in CONSOLE logger mode.');
    }
  }

  async sendMail({ to, subject, html, text }) {
    if (!this.transporter || !ENV.EMAIL_ENABLED) {
      console.log('================== 📧 [DEV EMAIL SIMULATOR] ==================');
      console.log(`To: ${to}`);
      console.log(`From: ${ENV.MAIL_FROM}`);
      console.log(`Subject: ${subject}`);
      console.log('--- Plain Text Preview ---');
      console.log(text || '(No text content)');
      console.log('==============================================================');
      return { success: true, messageId: 'simulated-' + Date.now() };
    }

    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const info = await this.transporter.sendMail({
          from: ENV.MAIL_FROM,
          to,
          subject,
          text,
          html
        });
        return { success: true, messageId: info.messageId, attempt };
      } catch (err) {
        lastError = err;
        console.error(`[EmailService] Attempt ${attempt} failed for ${to}:`, err.message);
        if (attempt < 3) {
          await new Promise((res) => setTimeout(res, 1000 * attempt)); // wait before retry
        }
      }
    }

    return { success: false, error: lastError?.message || 'Failed after 3 attempts' };
  }
}

export const emailService = new EmailService();
