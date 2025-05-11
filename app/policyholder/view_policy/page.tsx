"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ViewPolicyPage = () => {
  const [policyData, setPolicyData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("policyholderEmail");
    if (!email) {
      setError("You are not logged in.");
      return;
    }

    setLoading(true);
    fetchPolicyDetails(email);
  }, []);

  const fetchPolicyDetails = async (email: string) => {
    try {
      const res = await fetch("/api/get-policy-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setPolicyData(data.policyholder);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error fetching policy details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <header className="style-strip">
        <h1 className="header-title">View Your Policy</h1>
        <div className="button-container">
          <button onClick={() => window.history.back()} className="back-button">
            Back
          </button>
        </div>
      </header>
  
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
  
      {policyData?.policies?.length > 0 ? (
        <>
          <div className="table-container">
            <h2 className="headingss">Policy Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Policy Number</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Date of Birth</th>
                  <th>Phone</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {policyData.policies.map((policy: any) => (
                  <tr key={policy.id}>
                    <td>{policy.policy_number}</td>
                    <td>{policy.fullName}</td>
                    <td>{policy.email}</td>
                    <td>{new Date(policy.dateOfBirth).toLocaleDateString()}</td>
                    <td>{policy.phone}</td>
                    <td>{new Date(policy.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          <div className="table-container">
            <h2 className="headingss">Beneficiaries</h2>
            {policyData.beneficiaries.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Relationship</th>
                    <th>Date of Birth</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {policyData.beneficiaries.map((b: any) => (
                    <tr key={b.id}>
                      <td>{b.fullName}</td>
                      <td>{b.relationship}</td>
                      <td>{new Date(b.dateOfBirth).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={
                            b.status === "Approved"
                              ? "approved-status"
                              : b.status === "Rejected"
                              ? "rejected-status"
                              : "pending-status"
                          }
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No beneficiaries added yet.</p>
            )}
          </div>
        </>
      ) : (
        <p>No policies found.</p>
      )}
    </div>
  );
  
};

export default ViewPolicyPage;
