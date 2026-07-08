const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"CollabSphere" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  console.log('\n==================================================');
  console.log(`🔑 PASSWORD RESET LINK FOR ${email}:`);
  console.log(resetUrl);
  console.log('==================================================\n');
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">CollabSphere</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Department Collaboration Platform</p>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #475569; line-height: 1.6;">You requested a password reset. Click the button below to create a new password. This link expires in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">If you didn't request this, please ignore this email. Your password won't be changed.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">CollabSphere — Connecting Students, Faculty & Alumni</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject: 'Password Reset — CollabSphere', html });
};

module.exports = { sendEmail, sendPasswordResetEmail };
