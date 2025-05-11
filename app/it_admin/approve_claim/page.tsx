'use client'

import React from 'react';

const ApproveClaimPage = () => {
  // Dummy claim data
  const claims = [
    { id: 1, claimant: 'John Doe', amount: 500, status: 'Pending' },
    { id: 2, claimant: 'Jane Smith', amount: 1200, status: 'Pending' },
    { id: 3, claimant: 'Sam Green', amount: 300, status: 'Pending' },
  ];

  // Function to handle claim approval
  const handleApprove = (claimId: number) => {
    console.log(`Claim ${claimId} has been approved.`);
    // Here you would typically update the claim status and persist it
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                  {/* Header Strip */}
                  <header className="style-strip">
        <h1 className="header-title">Approve Claims</h1>
      </header>
      <p>Review and approve pending claims below.</p>

      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>Claim ID</th>
            <th style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>Claimant</th>
            <th style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>Amount</th>
            <th style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>Status</th>
            <th style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <tr key={claim.id}>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{claim.id}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{claim.claimant}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>${claim.amount}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{claim.status}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                <button
                  onClick={() => handleApprove(claim.id)}
                  style={{
                    backgroundColor: '#32CD32',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                  }}
                >
                  Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApproveClaimPage;
