//process_claim code
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ClaimFile = {
  ocr_claim_id: any;
  id: number;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  policy_holder_id: number;
  status: string;
  policyHolder: {
    email: string;
  };
};


const ClaimsPage = () => {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [claims, setClaims] = useState<ClaimFile[]>([]);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch claims on component mount
  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/get_claims'); // Use your endpoint here
        const data = await res.json();

        if (res.ok) {
          setClaims(data.claims); // Assuming data.claims is the array of claims
        } else {
          setError(data.message || 'Failed to fetch claims');
        }
      } catch (err) {
        setError('An error occurred while fetching claims.');
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);
  
  

  // Refresh claims list
  const refreshClaims = async () => {
    try {
      const res = await fetch('/api/get_claims');
      const data = await res.json();
      if (res.ok) {
        setClaims(data.claims);
      } else {
        setError(data.message || 'Failed to fetch updated claims');
      }
    } catch {
      
    }
  };

  // Handle approve action
  const handleApprove = async (id: number) => {
    const email = localStorage.getItem('policyholderEmail');
    if (!email) {
      setError('Email not found in localStorage.');
      return;
    }
  
    setError('');
    setSuccessMessage('');
    setLoading(true);
    setProcessingId(id); // Set processingId
  
    try {
      const res = await fetch(`/api/update_claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, action: 'approve', email }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setSuccessMessage(data.message);
        refreshClaims();
      } else {
        setError(data.message || 'Error approving claim');
      }
    } catch (err) {
      setError('An error occurred while approving the claim.');
    } finally {
      setLoading(false);
      setProcessingId(null); // Clear processingId
    }
  };

  // Handle reject action
  const handleReject = async (id: number) => {
    const email = localStorage.getItem('policyholderEmail');
    if (!email) {
      setError('Email not found in localStorage.');
      return;
    }
  
    setError('');
    setSuccessMessage('');
    setLoading(true);
    setProcessingId(id); // Set processingId
  
    try {
      const res = await fetch(`/api/update_claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, action: 'reject', email }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setSuccessMessage(data.message);
        refreshClaims();
      } else {
        setError(data.message || 'Error rejecting claim');
      }
    } catch (err) {
      setError('An error occurred while rejecting the claim.');
    } finally {
      setLoading(false);
      setProcessingId(null); // Clear processingId
    }
  };

  // Handle generate action and OCR processing
  // Handle generate action and OCR processing
const handleGenerate = async (id: number, filePath: string) => {
  setError('');
  setSuccessMessage('');
  setLoading(true);
  setProcessingId(id);

  try {
    // filePath is already a full public URL from UploadThing, so use it directly
    const fileUrl = filePath;

    const res = await fetch('/api/perform-ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl, claimId: id }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Failed to process OCR.');
      return;
    }

    // Update claim state to show View button
    setClaims((prev) =>
      prev.map((claim) =>
        claim.id === id ? { ...claim, status: 'Generated', ocr_claim_id: data.id } : claim
      )
    );

    setSuccessMessage('Claim generated successfully.');
  } catch (err) {
    console.error(err);
    setError('An error occurred while generating the claim.');
  } finally {
    setLoading(false);
    setProcessingId(null);
  }
};

  


  // Handle back navigation
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div>
      <header className="style-strip">
        <h1 className="header-title">Claims Management</h1>
        <div className="button-container">
          <button onClick={handleBack} className="back-button">
            Back
          </button>
        </div>
      </header>
      {loading && <p>Loading...</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Uploaded At</th>
              <th>Policy Holder Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id}>
                <td>
                  <a
                    href={claim.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {claim.file_name}
                  </a>
                </td>
                <td>{new Date(claim.uploaded_at).toLocaleString()}</td>
                <td>{claim.policyHolder.email}</td>
                <td>
                  {claim.status === 'Approved' ? (
                    <span className="approved-status">Approved</span>
                  ) : claim.status === 'Rejected' ? (
                    <span className="rejected-status">Rejected</span>
                  ) : claim.status === 'Generated' ? (
                    <span className="generated-status">Generated</span>
                  ) : (
                    <span className="pending-status">Pending</span>
                  )}
                </td>
                <td>
                  {claim.status === 'Pending' ? (
                    <div className="action-container">
                      <button
                        onClick={() => handleApprove(claim.id)}
                        disabled={processingId === claim.id}
                      >
                        {processingId === claim.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(claim.id)}
                        disabled={processingId === claim.id}
                      >
                        {processingId === claim.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  ) : claim.status === 'Approved' ? (
                    <div className="action-container">
                      <button
                        className="generate-button"
                        onClick={() => handleGenerate(claim.id, claim.file_path)}
                        disabled={processingId === claim.id}
                      >
                        {processingId === claim.id ? 'Generating...' : 'Generate'}
                      </button>
                    </div>
                  ) : claim.status === 'Generated' ? (
<div className="action-container">
  {claim.ocr_claim_id ? (
    <button
    className="view-button"
    onClick={() => router.push(`/system_admin/view-claims/${claim.ocr_claim_id}`)}
  >
    View
  </button>
  
  ) : (
    <span>No OCR Record</span>
  )}
</div>
                  ) : (
                    <button
                      style={{
                        backgroundColor: claim.status === 'Approved' ? 'blue' : 'red',
                        color: 'white',
                        cursor: 'default',
                      }}
                      disabled
                    >
                      {claim.status}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClaimsPage;
