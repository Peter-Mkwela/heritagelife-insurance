'use client';
import { useState, useEffect } from 'react';

type Backup = {
  id: number;
  name: string;
  createdAt: string;
};

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/get-backups');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch backups.');
      setBackups(data.backups);
    } catch (err) {
      setErrorMessage('Failed to load backups.');
    }
  };

  const createBackup = async () => {
    setSuccessMessage('');
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/create-backup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Backup failed.');
      setSuccessMessage('Backup created successfully.');
      fetchBackups();
    } catch (err) {
      setErrorMessage('Error creating backup.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  return (
    <div className="view-application-container">
      <header className="style-strip">
        <h1 className="header-title">System Backup</h1>
        <div className="header-controls-split">
          <div className="left-controls">
            <button
              onClick={createBackup}
              className="uniform-button"
              disabled={loading}
            >
              {loading ? 'Backing up...' : 'Create Backup'}
            </button>
          </div>
          <div className="right-controls">
            <button
              onClick={() => window.history.back()}
              className="uniform-button"
            >
              Back
            </button>
          </div>
        </div>
      </header>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="table-container" style={{ marginTop: '1rem' }}>
        <table>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {backups.map((backup) => (
              <tr key={backup.id}>
                <td>{backup.name}</td>
                <td>{new Date(backup.createdAt).toLocaleString()}</td>
                <td>
                  <a
                    href={`/api/download-backup?file=${backup.name}`}
                    className="uniform-button"
                    download
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
            {backups.length === 0 && (
              <tr>
                <td colSpan={3}>No backups found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
