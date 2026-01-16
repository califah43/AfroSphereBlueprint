import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Gmail credentials missing. Skipping email.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"AfroSphere" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export function getSignupEmailTemplate(username: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
      <h1 style="color: #D4AF37;">Welcome to AfroSphere, @${username}!</h1>
      <p>We're thrilled to have you join our community of African creators.</p>
      <p>Start sharing your fashion, art, music, and culture today.</p>
      <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <p style="margin: 0;">If you didn't create this account, please ignore this email.</p>
      </div>
    </div>
  `;
}

export function getPasswordChangeEmailTemplate(username: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #D4AF37;">Password Changed</h2>
      <p>Hello @${username},</p>
      <p>The password for your AfroSphere account was recently changed.</p>
      <p>If you did not make this change, please contact support immediately.</p>
      <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <p style="margin: 0;">This is an automated security notification.</p>
      </div>
    </div>
  `;
}
