'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type UserUpload = {
  ocr_application_id: any;
  id: number;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  policy_holder_id: number;
  status: string; // Approved, Rejected, or Pending
  policyHolder: {
    email: string;
  };
  generated?: boolean; 
};

const ApprovalsPage = () => {
  const router = useRouter();
  const [uploads, setUploads] = useState<UserUpload[]>([]);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<number | null>(null); // Tracks which item is being processed

  // Fetch uploads on component mount
  useEffect(() => {
    const fetchUploads = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/get_user_uploads');
        const data = await res.json();
        if (res.ok) {
          setUploads(data.uploads);
        } else {
          setError(data.message || 'Failed to fetch uploads');
        }
      } catch (err) {
        setError('An error occurred while fetching uploads.');
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  // Handle approve action
  const handleApprove = async (id: number) => {
    setError('');
    setSuccessMessage('');
    setProcessingId(id); // Set processingId

    try {
      const res = await fetch(`/api/update_user_upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('Application Approved');

        setUploads((prevUploads) =>
          prevUploads.map((upload) =>
            upload.id === id ? { ...upload, status: 'Approved', generated: false } : upload
          )
        );
      } else {
        setError(data.message || 'Error approving application');
      }
    } catch (err) {
      setError('An error occurred while approving the application.');
    } finally {
      setProcessingId(null); // Clear processingId
    }
  };

  // Handle reject action
  const handleReject = async (id: number) => {
    setError('');
    setSuccessMessage('');
    setProcessingId(id); // Set processingId

    try {
      const res = await fetch(`/api/update_user_upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject' }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('Application Rejected');

        setUploads((prevUploads) =>
          prevUploads.map((upload) =>
            upload.id === id ? { ...upload, status: 'Rejected' } : upload
          )
        );
      } else {
        setError(data.message || 'Error rejecting application');
      }
    } catch (err) {
      setError('An error occurred while rejecting the application.');
    } finally {
      setProcessingId(null); // Clear processingId
    }
  };

  // Handle generate action
  const handleGenerate = async (id: number, filePath: string, fileName: string) => {
    setError('');
    setSuccessMessage('');
    setLoading(true);
    setProcessingId(id); // Set processingId
  
    try {
      const fileUrl = `${filePath}?filename=${encodeURIComponent(fileName)}`;
  
      if (!fileUrl.startsWith('http')) {
        setError('Invalid file URL.');
        return;
      }
  
      // Step 1: Send file to OCR API
      const ocrRes = await fetch('/api/application-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl }),
      });
  
      const ocrData = await ocrRes.json();
      console.log("OCR API Response:", ocrData);
  
      if (!ocrRes.ok || !ocrData.id) {
        setError(ocrData.error || 'Failed to process OCR.');
        return;
      }
  
      const applicationId = ocrData.id;
  
      // Step 2: Update userUploads with OCR application ID
      const updateRes = await fetch('/api/update-application-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ocrApplicationId: applicationId, action: 'generate' }),
      });
  
      const updateData = await updateRes.json();
      console.log("Update API Response:", updateData);
  
      if (!updateRes.ok) {
        setError(updateData.error || 'Failed to update application ID.');
        return;
      }
  
      // Step 3: Create a new policy record
      const createPolicyRes = await fetch('/api/create-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userUploadId: id }),
      });
  
      const policyData = await createPolicyRes.json();
      console.log("Policy Creation Response:", policyData);
  
      if (!createPolicyRes.ok) {
        setError(policyData.error || 'Failed to create policy.');
        return;
      }
  
      // Step 4: Update UI with the new state
      setUploads((prev) =>
        prev.map((upload) =>
          upload.id === id
            ? { ...upload, status: 'Generated', ocr_application_id: applicationId }
            : upload
        )
      );
  
      setSuccessMessage('Application and Policy generated successfully.');
    } catch (err) {
      console.error('Error occurred:', err);
      setError('An error occurred during the generate process.');
    } finally {
      setLoading(false);
      setProcessingId(null); // Clear processingId
    }
  };
  



  return (
    <div>
      <header className="style-strip">
        <h1 className="header-title">Manage Policyholder Applications</h1>
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
            {uploads.map((upload) => (
              <tr key={upload.id}>
                <td>
  <a
    href={upload.file_path}
    target="_blank"
    rel="noopener noreferrer"
  >
    {upload.file_name}
  </a>
</td>

                <td>{new Date(upload.uploaded_at).toLocaleString()}</td>
                <td>{upload.policyHolder.email}</td>
                <td>
                  {upload.status === 'Approved' ? (
                    <span className="approved-status">Approved</span>
                  ) : upload.status === 'Rejected' ? (
                    <span className="rejected-status">Rejected</span>
                  ) : upload.status === 'Generated' ? (
                    <span className="generated-status">Generated</span>
                  ) : (
                    <span className="pending-status">Pending</span>
                  )}
                </td>
                <td>
                  {upload.status === 'Pending' ? (
                    <div className="action-container">
                      <button
                        onClick={() => handleApprove(upload.id)}
                        disabled={processingId === upload.id}
                      >
                        {processingId === upload.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(upload.id)}
                        disabled={processingId === upload.id}
                      >
                        {processingId === upload.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  ) : upload.status === 'Approved' ? (
                    <div className="action-container">
                      <button
                        className="generate-button"
                        onClick={() => handleGenerate(upload.id, upload.file_path, upload.file_name)}
                        disabled={processingId === upload.id}
                      >
                        {processingId === upload.id ? 'Generating...' : 'Generate'}
                      </button>
                    </div>
                  ) : upload.status === 'Generated' ? (
                    <div className="action-container">
                      <button
  className="view-button"
  onClick={() => router.push(`/system_admin/view-applications/${upload.ocr_application_id}`)}
>
  View
</button>

                    </div>
                  ) : (
                    <button
                      style={{
                        backgroundColor: upload.status === 'Approved' ? 'blue' : 'red',
                        color: 'white',
                        cursor: 'default',
                      }}
                      disabled
                    >
                      {upload.status}
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

export default ApprovalsPage;