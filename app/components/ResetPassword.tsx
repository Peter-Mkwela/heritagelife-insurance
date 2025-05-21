"use client";

import { useState } from "react";
import Link from "next/link";

const ResetPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call for password reset (replace with your backend logic)
    setTimeout(() => {
      setMessage("Reset link sent to your email address, check in a few minutes");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="policy-container">
      <div className="form-container">
        <h1 className="policy-heading">Reset Your Password</h1>
        <p className="description">
          Enter your email address, and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="form-content">
          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter your email"
            />
          </div>

          <div className="cta-buttons-container">
            <button type="submit" className="login-signup-cta-button">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <Link href="/policyholder">
              <button type="button" className="login-signup-cta-button back-button">
                Back
              </button>
            </Link>
          </div>
        </form>

        {message && <p className="login-signup-message" style={{ color: 'red' }}>{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;