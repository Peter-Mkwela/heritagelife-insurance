'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Policyholder = {
  id: number;
  full_name: string;
  email: string;
  premium: number; // Premium amount
  created_at: string; // Registration date
  commission: number; // Commission (calculated)
};

const ViewCommissionPage = () => {
  const [policyholders, setPolicyholders] = useState<Policyholder[]>([]);
  const [error, setError] = useState<string>('');
  const [commissionPercentage] = useState<number>(5); // Assuming a 5% commission
  const router = useRouter();

  useEffect(() => {
    const agentId = localStorage.getItem('agent_id');
    console.log('Agent ID:', agentId);
    if (!agentId) {
      setError('Agent not logged in');
      return;
    }

    const fetchPolicyholders = async () => {
      try {
        const res = await fetch(`/api/get_commission?agent_id=${agentId}`);
        const data = await res.json();
        if (res.ok) {
          const policyholdersWithCommission = data.policyholders.map((policyholder: any) => ({
            ...policyholder,
            commission: (policyholder.premium * commissionPercentage) / 100,
          }));
          setPolicyholders(policyholdersWithCommission);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch policyholders');
      }
    };

    fetchPolicyholders();
  }, [commissionPercentage]);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="view-commission-container">
      <header className="style-strip">
        <h1 className="header-title">View Your Commission</h1>
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
              <th>Email</th>
              <th>Premium</th>
              <th>Commission (5%)</th>
              <th>Registration Date</th>
            </tr>
          </thead>
          <tbody>
            {policyholders.map((policyholder) => (
              <tr key={policyholder.id}>
                <td>{policyholder.full_name}</td>
                <td>{policyholder.email}</td>
                <td>${policyholder.premium.toFixed(2)}</td>
                <td>${policyholder.commission.toFixed(2)}</td>
                <td>{new Date(policyholder.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {policyholders.length > 0 && (
        <div className="total-commission">
          <h3>
            Total Commission: $
            {policyholders.reduce((acc, p) => acc + p.commission, 0).toFixed(2)}
          </h3>
        </div>
      )}
    </div>
  );
};

export default ViewCommissionPage;
