'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Claim = {
  id: number;
  claimNo: string;
  policyNo: string;
  deceasedName: string;
  deceasedLastName: string;
  cause: string;
  DOD: string;
  created_at: string;
};

const ViewClaimPage = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await fetch('/api/get-ocr-claim');
        const data = await res.json();

        if (res.ok) {
          setClaims(data);
        } else {
          setError(data.error || 'Failed to fetch claims');
        }
      } catch (err) {
        setError('Failed to fetch claims');
      }
    };

    fetchClaims();
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="view-claim-page">
      <header className="style-strip">
        <div className="strip-inner">
          <h1 className="header-title">View Claim Details</h1>
          <div className="button-container">
            <button onClick={handleBack} className="back-button">Back</button>
          </div>
        </div>
      </header>
  
      {error && <p className="error-message">{error}</p>}
  
      {claims.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Claim Number</th>
                <th>Policy Number</th>
                <th>Deceased Name</th>
                <th>Cause of Death</th>
                <th>Date of Death</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id}>
                  <td>{claim.id}</td>
                  <td>{claim.claimNo}</td>
                  <td>{claim.policyNo}</td>
                  <td>{claim.deceasedName} {claim.deceasedLastName}</td>
                  <td>{claim.cause}</td>
                  <td>{new Date(claim.DOD).toLocaleDateString()}</td>
                  <td>{new Date(claim.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>No claims available.</div>
      )}
    </div>
  );
  
};

export default ViewClaimPage;
