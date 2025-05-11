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

export default function ModifyPolicyPage() {
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

  const handleSave = async () => {
    setSuccessMessage('');
    setError('');
  
    try {
      const res = await fetch('/api/update-policy-and-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyId: policy?.id,
          ocrApplicationId: application?.id,
          updatedPolicyData: {
            policy_number: policy?.policy_number,
            fullName: policy?.fullName,
            email: policy?.email,
            phone: policy?.phone,
            dateOfBirth: policy?.dateOfBirth,
          },
          updatedOcrApplicationData: {
            fullName: application?.fullName,
            dateOfBirth: application?.dateOfBirth,
            phone: application?.phone,
            address: application?.address,
            medicalCondition: application?.medicalCondition,
            preferredPremium: application?.preferredPremium,
          },
        }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update data.');
      setSuccessMessage('Data updated successfully.');
    } catch (err) {
      setError('An error occurred while updating data.');
    }
  };
  
  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    target: 'policy' | 'application',
    field: string
  ) => {
    const value = e.target.value;
    if (target === 'policy' && policy) setPolicy({ ...policy, [field]: value });
    if (target === 'application' && application) setApplication({ ...application, [field]: value });
  };

  return (
    <div className="view-application-container">
   <header className="style-strip">
  <h1 className="header-title">Modify Policy</h1>

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
      <button onClick={handleSave} className="uniform-button">
        Save Changes
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
                <td>
                  <input
                    value={policy?.fullName || application?.fullName || ''}
                    onChange={(e) => {
                      handleChange(e, 'policy', 'fullName');
                      handleChange(e, 'application', 'fullName');
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td>Email</td>
                <td>
                  <input
                    value={policy?.email || ''}
                    onChange={(e) => handleChange(e, 'policy', 'email')}
                  />
                </td>
              </tr>
              <tr>
                <td>Policy Number</td>
                <td>
                  <input
                    value={policy?.policy_number || ''}
                    onChange={(e) => handleChange(e, 'policy', 'policy_number')}
                  />
                </td>
              </tr>
              <tr>
                <td>Phone</td>
                <td>
                  <input
                    value={policy?.phone || application?.phone || ''}
                    onChange={(e) => {
                      handleChange(e, 'policy', 'phone');
                      handleChange(e, 'application', 'phone');
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td>Date of Birth</td>
                <td>
                  <input
                    type="date"
                    value={
                      policy?.dateOfBirth?.slice(0, 10) ||
                      application?.dateOfBirth?.slice(0, 10) ||
                      ''
                    }
                    onChange={(e) => {
                      handleChange(e, 'policy', 'dateOfBirth');
                      handleChange(e, 'application', 'dateOfBirth');
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td>Address</td>
                <td>
                  <textarea
                    value={application?.address || ''}
                    onChange={(e) => handleChange(e, 'application', 'address')}
                  />
                </td>
              </tr>
              <tr>
                <td>Medical Condition</td>
                <td>
                  <input
                    value={application?.medicalCondition || ''}
                    onChange={(e) => handleChange(e, 'application', 'medicalCondition')}
                  />
                </td>
              </tr>
              <tr>
                <td>Preferred Premium</td>
                <td>
                  <input
                    value={application?.preferredPremium || ''}
                    onChange={(e) => handleChange(e, 'application', 'preferredPremium')}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
