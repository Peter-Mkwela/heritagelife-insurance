'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddUserForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('AGENT');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/add_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password, role, full_name: fullName }),
    });

    if (res.ok) {
      setSuccessMessage('Successfully added a new user!');
      setError('');
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('AGENT');
      setFullName('');

      setTimeout(() => setSuccessMessage(''), 2000);
    } else {
      setError('Failed to add user');
    }
  };

  const handleBack = () => {
    router.push('/it_admin/');
  };

  return (
    <div className="userss-container">
      {/* Header Strip */}
      <header className="style-strip">
        <h1 className="header-title">Add New User</h1>
        <div className="button-container">
          <button onClick={handleBack} className="back-button">
            Back
          </button>
        </div>
      </header>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="add-user-form-wrapper">
        <form onSubmit={handleSubmit} className="add-user-form">
          <div className="add-user-form-group">
            <label htmlFor="username" className="add-user-label">Username:</label>
            <input
              type="text"
              id="username"
              className="add-user-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="add-user-form-group">
            <label htmlFor="email" className="add-user-label">Email:</label>
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
            <label htmlFor="password" className="add-user-label">Password:</label>
            <input
              type="password"
              id="password"
              className="add-user-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="add-user-form-group">
            <label htmlFor="role" className="add-user-label">Role:</label>
            <select
              id="role"
              className="add-user-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="IT_ADMIN">IT Admin</option>
              <option value="SYSTEM_ADMIN">System Admin</option>
              <option value="STAKEHOLDER">Stakeholder</option>
              <option value="AGENT">Agent</option>
            </select>
          </div>
          <div className="add-user-form-group">
            <label htmlFor="fullName" className="add-user-label">Full Name:</label>
            <input
              type="text"
              id="fullName"
              className="add-user-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="add-user-button-group">
            <button type="submit" className="add-user-cta-button">
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
