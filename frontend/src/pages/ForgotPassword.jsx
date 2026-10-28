import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // SEND OTP
  // ==========================================

  const handleSendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/forgot-password", {
        email,
      });

      setSuccess(
        "OTP sent to your email. Please check your inbox."
      );

      setStep(2);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!otp || !newPassword || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "Password must contain at least 6 characters"
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      setSuccess(
        "Password reset successfully. You can now login."
      );

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>Digital Evidence</h1>

        <p className="login-subtitle">
          {step === 1
            ? "Reset your password"
            : "Enter verification code"}
        </p>

        {/* ERROR */}

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="login-success">
            {success}
          </div>
        )}

        {/* ==================================
            STEP 1
        ================================== */}

        {step === 1 && (

          <form onSubmit={handleSendOtp}>

            <div className="form-group">

              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Send OTP"}
            </button>

          </form>
        )}

        {/* ==================================
            STEP 2
        ================================== */}

        {step === 2 && (

          <form onSubmit={handleResetPassword}>

            <div className="form-group">

              <label>OTP</label>

              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6 digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value)
                }
              />

            </div>

            <div className="form-group">

              <label>New Password</label>

              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
              />

            </div>

            <div className="form-group">

              <label>Confirm Password</label>

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
              />

            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Resetting..."
                : "Reset Password"}
            </button>

          </form>
        )}

        {/* BACK TO LOGIN */}

        <div className="login-links">

          <Link to="/login">
            Back to Login
          </Link>

        </div>

        <div className="login-footer">
          Secure Digital Evidence Management
        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;