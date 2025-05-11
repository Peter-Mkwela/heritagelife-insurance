'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ApplyPage = () => {
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [agents, setAgents] = useState<{ id: number; full_name: string }[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>(''); // Default to empty
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  // Fetch Agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/get_agents');
        const data = await res.json();
        if (res.ok) {
          setAgents(data.agents);
        } else {
          console.error('Failed to fetch agents:', data.message);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };

    fetchAgents();
  }, []);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !file) {
      setError('Please provide your email and upload a filled form.');
      return;
    }

    console.log('Selected agent:', selectedAgent);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('file', file);
    formData.append('agent_id', selectedAgent || 'null'); // Pass agent_id (null if Direct Office)

    try {
      const res = await fetch('/api/upload_policy', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('Application submitted successfully!');
        setError('');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error submitting the application.');
    }
  };

  return (
    <div className="users-container">
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
            <label htmlFor="email" className="add-user-label">Your Email:</label>
            <input
              type="email"
              id="email"
              className="add-user-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Agent Selection Dropdown */}
          <div className="form-group">
            <label htmlFor="agent" className="add-user-label">Select Agent (or Direct Office):</label>
            <select
              id="agent"
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
            <button type="submit" className="add-user-cta-button">Submit Application</button>
            <button type="button" onClick={() => router.push('/policyholder/main/')} className="add-user-back-button">
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyPage;
