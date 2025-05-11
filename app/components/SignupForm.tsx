"use client";

import { useState } from "react";
import Link from "next/link";

const SignupForm = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate signup (replace with your actual signup logic)
    setTimeout(() => {
      setMessage("Account created successfully!");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="policy-container">
      <div className="form-container">
        <h1 className="policy-heading">Create Your Account</h1>
        <p className="description">Please enter your details to sign up.</p>

        <form onSubmit={handleSubmit} className="form-content">
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              className="input-field"
            />
          </div>

          <button type="submit" className="login-signup-cta-button">
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {message && <p className="login-signup-message">{message}</p>}

        <div className="login-signup-links">
          <Link href="/policyholder" className="login-signup-link">
            Already have an account? Log in
          </Link>

        </div>
      </div>
    </div>
  );
};

export default SignupForm;
