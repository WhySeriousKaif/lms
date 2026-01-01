import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ejs from 'ejs';
import path from 'path';

dotenv.config();

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

const sendMail = async (options: EmailOptions): Promise<void> => {
  // Check if SMTP credentials are configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('⚠️  SMTP credentials not configured. Email sending skipped.');
    console.warn('   Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD in your .env file');
    return;
  }

  try {
    const port = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
      port: port,
      secure: port === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
      tls: {
        // Do not fail on invalid certificates
        rejectUnauthorized: false,
      },
  });

    // Verify connection configuration
    await transporter.verify();

  const { email, subject, template, data } = options;

  // Absolute path to EJS template
  const templatePath = path.join(__dirname, '../mails', template);

  // Render HTML
  const html = await ejs.renderFile(templatePath, data);

  // Send mail
  await transporter.sendMail({
    from: `"LMS Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });
    
    console.log(`✅ Activation email sent successfully to ${email}`);
  } catch (error: any) {
    console.error('❌ Error sending email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('   Authentication failed. For Gmail, you may need to:');
      console.error('   1. Enable 2-Factor Authentication');
      console.error('   2. Generate an App Password (not your regular password)');
      console.error('   3. Use the App Password in SMTP_PASSWORD');
    }
    // Don't throw - let the calling code handle it
    console.error('   Email sending failed, but registration will continue');
  }
};

export default sendMail;