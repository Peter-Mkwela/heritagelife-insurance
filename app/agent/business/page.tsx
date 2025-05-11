'use client';
import { useEffect, useState } from 'react';

type Policyholder = {
  id: number;
  fullName: string;
  address: string;
  phone: string;
  dateOfBirth: string;
  preferredPremium: string;
  created_at: string;
};

const TrackBusinessPage = () => {
  const [policyholders, setPolicyholders] = useState<Policyholder[]>([]);
  const [error, setError] = useState<string>('');
  const agentId = typeof window !== 'undefined' ? localStorage.getItem('agent_id') : null;

  useEffect(() => {
    const fetchPolicyholders = async () => {
      if (!agentId) {
        setError('Agent not logged in');
        return;
      }

      try {
        const res = await fetch(`/api/get_policyholders_by_agent?agent_id=${agentId}`);
        const data = await res.json();
        if (res.ok) {
          setPolicyholders(data.policyholders);
        } else {
          setError(data.message || 'Failed to fetch policyholders');
        }
      } catch (err) {
        setError('Failed to fetch policyholders');
      }
    };

    fetchPolicyholders();
  }, [agentId]);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="track-business-container">
      <header className="style-strip">
        <h1 className="header-title">Track Your Business</h1>
        <div className="button-container">
          <button onClick={handleBack} className="back-button">
            Back
          </button>
        </div>
      </header>

      {error && <p className="error-message">{error}</p>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Date of Birth</th>
              <th>Preferred Premium</th>
              <th>Registration Date</th>
            </tr>
          </thead>
          <tbody>
            {policyholders.map((policyholder) => (
              <tr key={policyholder.id}>
                <td>{policyholder.fullName}</td>
                <td>{policyholder.address}</td>
                <td>{policyholder.phone}</td>
                <td>{new Date(policyholder.dateOfBirth).toLocaleDateString()}</td>
                <td>{policyholder.preferredPremium}</td>
                <td>{new Date(policyholder.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrackBusinessPage;
