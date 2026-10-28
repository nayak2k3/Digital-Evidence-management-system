import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../utils/sendEmail.js";

/* =========================================================
   REGISTER USER
========================================================= */

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        
        message: "Name, email and password are required",
      });
    }

    // 2. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    // 3. Clean email
    const cleanedEmail = email.trim().toLowerCase();

    // 4. Check if user already exists
    const existingUser = await User.findOne({
      email: cleanedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create user
    // Publicly registered users are always viewers
    const user = await User.create({
      name: name.trim(),
      email: cleanedEmail,
      password: hashedPassword,
      role: "viewer",
    });

    // 7. Send response
    res.status(201).json({
      message: "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};


/* =========================================================
   LOGIN USER
========================================================= */

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN EMAIL:", email);

    console.log(
      "PASSWORD RECEIVED:",
      password ? "YES" : "NO"
    );

    // 1. Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2. Clean email
    const cleanedEmail = email.trim().toLowerCase();

    // 3. Find user
    const user = await User.findOne({
      email: cleanedEmail,
    });

    console.log(
      "USER FOUND:",
      user ? "YES" : "NO"
    );

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.log("USER ROLE:", user.role);
    console.log("USER ACTIVE:", user.isActive);

    // 4. Compare password
    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    console.log(
      "PASSWORD MATCH:",
      isPasswordCorrect ? "YES" : "NO"
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 5. Check account status
    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    // 6. Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // 7. Send response
    res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};


/* =========================================================
   FORGOT PASSWORD
========================================================= */

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check email
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // 2. Clean email
    const cleanedEmail = email.trim().toLowerCase();

    // 3. Find user
    const user = await User.findOne({
      email: cleanedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    // 4. Generate 6-digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // 5. OTP expires after 10 minutes
    user.resetPasswordOtp = otp;

    user.resetPasswordOtpExpires =
      new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    // 6. Send OTP to user's email
    try {
      await sendPasswordResetEmail(
        user.email,
        otp
      );
    } catch (error) {
      user.resetPasswordOtp = null;
      user.resetPasswordOtpExpires = null;
      await user.save();
      throw error;
    }

    // 7. Send response
    res.status(200).json({
      message:
        "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    const smtpConnectionTimedOut =
      error.code === "ESOCKET" &&
      error.command === "CONN";

    res.status(smtpConnectionTimedOut ? 503 : 500).json({
      message: smtpConnectionTimedOut
        ? "Could not connect to Gmail to send the OTP. Check that outbound SMTP on port 587 is allowed, then try again."
        : "Failed to send password reset OTP",
      errorCode: error.code,
      error: error.message,
    });
  }
};


/* =========================================================
   RESET PASSWORD
========================================================= */

export const resetPassword = async (req, res) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    // 1. Check required fields
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message:
          "Email, OTP and new password are required",
      });
    }

    // 2. Validate password
    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "Password must contain at least 6 characters",
      });
    }

    // 3. Clean email
    const cleanedEmail = email.trim().toLowerCase();

    // 4. Find user
    const user = await User.findOne({
      email: cleanedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 5. Check OTP
    if (
      user.resetPasswordOtp !== otp ||
      !user.resetPasswordOtpExpires
    ) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // 6. Check OTP expiration
    if (
      user.resetPasswordOtpExpires <
      new Date()
    ) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // 7. Hash new password
    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    // 8. Update password
    user.password = hashedPassword;

    // 9. Clear OTP
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;

    await user.save();

    // 10. Send response
    res.status(200).json({
      message:
        "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to reset password",
      error: error.message,
    });
  }
};