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
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch( '/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password, role, full_name: fullName }),
    });

    if (res.ok) {
      router.push('/it_admin/main'); // Redirect after success
    } else {
      setError('Failed to add user');
    }
  };

  return (
    <div className="policy-container">
      <div className="form-container">
        <h2 className="policy-heading">Add New User</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="form-content">
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="IT_ADMIN">IT Admin</option>
              <option value="SYSTEM_ADMIN">System Admin</option>
              <option value="STAKEHOLDER">Stakeholder</option>
              <option value="AGENT">Agent</option>
              <option value="POLICYHOLDER">Policyholder</option>
            </select>
          </div>
          <div>
            <label htmlFor="fullName">Full Name:</label>
            <input
              type="text"
              id="fullName"
              className="input-field"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="button-group">
            <button type="submit" className="cta-button">
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
