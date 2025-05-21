'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      setError("Please complete the CAPTCHA.");
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, captchaToken }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("policyholderEmail", result.email);
        console.log("Stored Email:", result.email);
        router.push("/policyholder/main");
      } else {
        setError(result.message || "Invalid email or password.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <label htmlFor="email">Email Address :</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="input-group">
        <label htmlFor="password">Password :</label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      {/* ✅ reCAPTCHA component */}
      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
          onChange={handleCaptchaChange}
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <button type="submit" className="cta-button cta-button-login">
        Login
      </button>
    </form>
  );
};

export default LoginForm;
