//apply claim policyholder frontend
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ApplyPage = () => {
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  // Function to handle navigation back
  const handleBack = () => {
    router.push('/policyholder/main/'); // Change this route to your desired "back" path
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !file) {
      setError('Please provide your email and upload a filled claim form.');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload_claim', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('Claim submitted successfully!');
        setError('');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error submitting the claim.');
    }
  };

  return (
    <div className="users-container">
            {/* Header Strip */}
            <header className="style-strip">
        <h1 className="header-title">Make a Claim</h1>
      </header>
      <div className="form container">


        {error && <p className="add-user-error">{error}</p>}
        {successMessage && <p className="add-user-success">{successMessage}</p>}

        <a href="/Claim-Notification-Form.pdf" download>
          <button type="button" className="add-user-cta-button">
            Download Claim Form
          </button>
        </a>

        <form onSubmit={handleSubmit} className="add-user-form">
          <div className="form-group">
            <label htmlFor="email" className="add-user-label">Enter your email:</label>
            <input
              type="email"
              id="email"
              className="add-user-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="add-user-form-group">
            <label htmlFor="file" className="add-user-label">Upload Filled Form (PDF/Image):</label>
            <input
              type="file"
              id="file"
              className="add-user-input"
              accept="application/pdf, image/*"
              onChange={handleFileUpload}
              required
            />
          </div>

          <div className="add-user-button-group">
            <button type="submit" className="add-user-cta-button">
              Submit Claim Form
            </button>
            <button type="button" onClick={handleBack} className="add-user-back-button">
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyPage;
