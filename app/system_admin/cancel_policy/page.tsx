'use client';
import { useState } from 'react';

type Policy = {
  id: number;
  policy_number: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  phone: string;
};

type Application = {
  id: number;
  fullName: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  medicalCondition: string;
  preferredPremium: string;
};

export default function CancelPolicyPage() {
  const [email, setEmail] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchData = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (policyNumber) params.append('policy_number', policyNumber);

      const res = await fetch(`/api/search-policy-and-application?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch data');
      setPolicy(data.policy);
      setApplication(data.application);
    } catch (err) {
      setError('An error occurred while fetching data.');
      setPolicy(null);
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setError('');
    setSuccessMessage('');

    if (!policy?.id) {
      setError('No policy selected to cancel.');
      return;
    }

    try {
      const res = await fetch('/api/cancel-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyId: policy.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel policy.');

      setSuccessMessage('Policy cancelled successfully.');
      setPolicy(null);
      setApplication(null);
    } catch (err) {
      setError('An error occurred while cancelling the policy.');
    }
  };

  return (
    <div className="view-application-container">
      <header className="style-strip">
        <h1 className="header-title">Cancel Policy</h1>

        <div className="header-controls-split">
          <div className="left-controls">
            <input
              type="text"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="uniform-input"
            />
            <input
              type="text"
              placeholder="Enter Policy Number"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              className="uniform-input"
            />
            <button onClick={fetchData} disabled={loading} className="uniform-button">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="right-controls">
            <button onClick={handleCancel} className="uniform-button">
              Cancel Policy
            </button>
            <button onClick={() => window.history.back()} className="uniform-button">
              Back
            </button>
          </div>
        </div>
      </header>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {(policy || application) && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Full Name</td>
                <td>{policy?.fullName || application?.fullName}</td>
              </tr>
              <tr>
                <td>Email</td>
                <td>{policy?.email}</td>
              </tr>
              <tr>
                <td>Policy Number</td>
                <td>{policy?.policy_number}</td>
              </tr>
              <tr>
                <td>Phone</td>
                <td>{policy?.phone || application?.phone}</td>
              </tr>
              <tr>
                <td>Date of Birth</td>
                <td>{policy?.dateOfBirth?.slice(0, 10) || application?.dateOfBirth?.slice(0, 10)}</td>
              </tr>
              <tr>
                <td>Address</td>
                <td>{application?.address}</td>
              </tr>
              <tr>
                <td>Medical Condition</td>
                <td>{application?.medicalCondition}</td>
              </tr>
              <tr>
                <td>Preferred Premium</td>
                <td>{application?.preferredPremium}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
