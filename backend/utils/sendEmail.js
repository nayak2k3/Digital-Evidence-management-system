import nodemailer from "nodemailer";

export const sendPasswordResetEmail = async (to, otp) => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s/g, "");

  if (!user || !pass) {
    throw new Error(
      "Email service is not configured. Set EMAIL_USER and EMAIL_PASS in the backend environment."
    );
  }

  // Create the transport only when sending, after server.js has loaded dotenv.
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: `"Digital Evidence System" <${user}>`,
    to,
    subject: "Password Reset OTP - Digital Evidence System",

    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset</h2>

        <p>Hello,</p>

        <p>
          You requested to reset your password for the
          Digital Evidence Management System.
        </p>

        <p>Your OTP is:</p>

        <h1 style="letter-spacing: 5px;">
          ${otp}
        </h1>

        <p>
          This OTP is valid for <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not request this password reset,
          please ignore this email.
        </p>

        <p>
          Regards,<br>
          Digital Evidence System
        </p>
      </div>
    `,
  });
};