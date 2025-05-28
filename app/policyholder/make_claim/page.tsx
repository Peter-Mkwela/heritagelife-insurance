'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomUploadButton from '../../components/CustomUploadButton';
import { toast, Toaster } from 'react-hot-toast';
import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

const ApplyPage = () => {
  const [email, setEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agents, setAgents] = useState<{ id: number; full_name: string }[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const router = useRouter();

  const { startUpload } = useUploadThing('policyholderUpload');

  // Autofill email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem('policyholderEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  // Fetch agents for dropdown
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/get_agents');
        const data = await res.json();
        if (res.ok) setAgents(data.agents);
      } catch {
        setError('Failed to fetch agents');
      }
    };
    fetchAgents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !selectedFile) {
      setError('Please upload your form and enter your email');
      setSuccessMessage('');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const uploadRes = await startUpload([selectedFile]);

      if (!uploadRes || uploadRes.length === 0) {
        setError('File upload failed');
        setIsSubmitting(false);
        return;
      }

      const { url, name } = uploadRes[0];

      const res = await fetch('/api/upload_policy_thing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fileUrl: url,
          fileName: name,
          agent_id: selectedAgent || 'null',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('File submitted successfully!');
        setSelectedFile(null);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setError('Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="users-container">
      <Toaster position="top-right" />

      <header className="style-strip">
        <h1 className="header-title">Apply for a Policy</h1>
      </header>

      <div className="form container">
        {error && <p className="add-user-error">{error}</p>}
        {successMessage && <p className="add-user-success">{successMessage}</p>}

        <a href="/Policy-application.pdf" download>
          <button type="button" className="add-user-cta-button">
            Download Application Form
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
            <label className="add-user-label">Select Agent (or Direct Office):</label>
            <select
              className="add-user-input"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <option value="">Direct Office</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="add-user-label">Upload Filled Form (PDF/Image):</label>
            <CustomUploadButton onFileSelected={setSelectedFile} />
          </div>

          <div className="add-user-button-group">
            <button
              type="submit"
              className="add-user-cta-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/policyholder/main/')}
              className="add-user-back-button"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyPage;
