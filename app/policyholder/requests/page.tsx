"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SendRequestPage = () => {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // Retrieve the policyholder's email from localStorage when the component mounts
  useEffect(() => {
    const storedEmail = localStorage.getItem("policyholderEmail");
    console.log("Retrieved email:", storedEmail);
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError("No policyholder email found. Please log in again.");
    }
  }, []);

  // Handle sending the message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message) {
      setError("Please enter a message.");
      return;
    }

    if (!email) {
      setError("No email found. Please log in again.");
      return;
    }

    const requestData = {
      email, // Include the policyholder's email
      message,
    };

    try {
      const res = await fetch("/api/send_request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("Your request has been sent successfully!");
        setError("");
        setMessage("");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Error sending the request.");
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.push("/policyholder/main"); // Change to the correct path for policyholder dashboard
  };

  return (
    <div className="users-container">
      <header className="style-strip">
        <h1 className="header-title">Send a Query to the System Administrator</h1>
      </header>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="form container">
        <form onSubmit={handleSubmit} className="send-request-form">
          <div className="form-group">
            <label htmlFor="message" className="form-label">
              Your Message:
            </label>
            <textarea
              id="message"
              className="form-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your query here..."
              rows={5}
              required
            />
          </div>

          <div className="button-group">
            <button type="submit" className="back-button">
              Send Request
            </button>
            <button type="button" onClick={handleBack} className="back-button">
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendRequestPage;
