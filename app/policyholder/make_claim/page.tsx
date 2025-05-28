'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomUploadButton from '../../components/CustomUploadButton';
import { toast, Toaster } from 'react-hot-toast';
import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

const MakeClaimPage = () => {
  const [email, setEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { startUpload, isUploading } = useUploadThing('policyholderUpload');

  useEffect(() => {
    const storedEmail = localStorage.getItem('policyholderEmail');
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !selectedFile) {
      toast.error('Please upload your form and enter your email');
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadRes = await startUpload([selectedFile]);

      if (!uploadRes || uploadRes.length === 0) {
        toast.error('File upload failed');
        setIsSubmitting(false);
        return;
      }

      const { url, name } = uploadRes[0];

      const res = await fetch('/api/upload_claim_thing', {
        method: 'POST',
        body: JSON.stringify({
          email,
          fileUrl: url,
          fileName: name,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Claim submitted successfully!');
        setSelectedFile(null);
      } else {
        toast.error(data.message || 'Submission failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="users-container">
      <Toaster position="top-right" />
      <header className="style-strip">
        <h1 className="header-title">Make a Claim</h1>
      </header>

      <div className="form container">
        <a href="/Claim-Notification-Form.pdf" download>
          <button type="button" className="add-user-cta-button">
            Download Claim Form
          </button>
        </a>

        <form onSubmit={handleSubmit} className="add-user-form">
          <div className="form-group">
            <label className="add-user-label">Your Email:</label>
            <input
              type="email"
              className="add-user-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="add-user-label">Upload Filled Form (PDF/Image):</label>
            <CustomUploadButton onFileSelected={setSelectedFile} />
          </div>

          <div className="add-user-button-group">
            <button
              type="submit"
              className="add-user-cta-button"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Claim Form'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/policyholder/main/')}
              className="add-user-back-button"
              disabled={isSubmitting}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MakeClaimPage;
