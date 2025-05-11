"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BeneficiaryPage = () => {
  const [email, setEmail] = useState("");
  const [policyNumbers, setPolicyNumbers] = useState<string[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // Fetch logged-in user's email and policy numbers on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("policyholderEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      fetchPolicyNumbers(storedEmail);
    } else {
      setError("User is not logged in.");
    }
  }, []);

  // Fetch policy numbers for the logged-in user
  const fetchPolicyNumbers = async (userEmail: string) => {
    try {
      const res = await fetch("/api/get-policy-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();

      if (res.ok) {
        setPolicyNumbers(data.policyNumbers);
        if (data.policyNumbers.length > 0) {
          setSelectedPolicy(data.policyNumbers[0]); // Select first policy by default
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error fetching policy numbers.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/beneficiary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          policy_number: selectedPolicy,
          fullName,
          relationship,
          dateOfBirth,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setSuccessMessage("Beneficiary added successfully!");
        setFullName("");
        setRelationship("");
        setDateOfBirth("");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setLoading(false);
      setError("Error submitting beneficiary details.");
    }
  };
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="users-container">
      <header className="style-strip">
        <h1 className="header-title">Add Beneficiary</h1>
        <div className="button-container">
          <button onClick={handleBack} className="back-button">
            Back
          </button>
        </div>
      </header>

      <div className="form container">
        {error && <p className="add-user-error">{error}</p>}
        {successMessage && <p className="add-user-success">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="add-user-form">
          <div className="form-group">
            <label className="add-user-label">Your Email:</label>
            <input type="email" className="add-user-input" value={email} disabled />
          </div>

          <div className="form-group">
            <label className="add-user-label">Select Policy Number:</label>
            <select
              className="add-user-input"
              value={selectedPolicy}
              onChange={(e) => setSelectedPolicy(e.target.value)}
              required
            >
              {policyNumbers.map((policy) => (
                <option key={policy} value={policy}>
                  {policy}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="add-user-label">Full Name:</label>
            <input
              type="text"
              className="add-user-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="add-user-label">Relationship:</label>
            <input
              type="text"
              className="add-user-input"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="add-user-label">Date of Birth:</label>
            <input
              type="date"
              className="add-user-input"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>

          <div className="add-user-button-group">
            <button type="submit" className="add-user-cta-button" disabled={loading}>
              {loading ? "Processing..." : "Submit Beneficiary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BeneficiaryPage;
