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
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [agents, setAgents] = useState<{ id: number; full_name: string }[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);  // NEW
  const router = useRouter();

  const { startUpload, isUploading } = useUploadThing('policyholderUpload');

  useEffect(() => {
    const storedEmail = localStorage.getItem('policyholderEmail');
    if (storedEmail) setEmail(storedEmail);
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/get_agents');
        const data = await res.json();
        if (res.ok) setAgents(data.agents);
      } catch {
        toast.error('Failed to fetch agents');
      }
    };
    fetchAgents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !selectedFile) {
      toast.error('Please upload your form and enter your email');
      return;
    }

    setIsSubmitting(true);  // START submitting

    try {
      const uploadRes = await startUpload([selectedFile]);

      if (!uploadRes || uploadRes.length === 0) {
        toast.error('File upload failed');
        setIsSubmitting(false);
        return;
      }

      const { url, name } = uploadRes[0];
      setFileUrl(url);
      setFileName(name);

      const res = await fetch('/api/upload_policy_thing', {
        method: 'POST',
        body: JSON.stringify({
          email,
          fileUrl: url,
          fileName: name,
          agent_id: selectedAgent || 'null',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('File submitted successfully!');  // SUCCESS message here
        setFileUrl('');
        setFileName('');
        setSelectedFile(null);
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Submission failed');
    } finally {
      setIsSubmitting(false);  // END submitting
    }
  };

  return (
    <div className="users-container">
      <Toaster position="top-right" />
      <header className="style-strip">
        <h1 className="header-title">Apply for a Policy</h1>
      </header>

      <div className="form container">
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
              disabled={isSubmitting || isUploading}  // disable button while uploading/submitting
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
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

export default ApplyPage;
