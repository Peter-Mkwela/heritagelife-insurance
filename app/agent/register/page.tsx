'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const RegisterPersonPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleBack = () => {
    window.history.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!fullName || !email || !password || !contact) {
      setError('Please fill in all fields');
      return;
    }

    const personData = {
      full_name: fullName,
      email,
      password,
      contact,
    };

    try {
      const res = await fetch('/api/register_person', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('Person registered successfully!');
        setError('');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error registering person.');
    }
  };

  return (
    <div className="register-container">
      <header className="style-strip">
        <h1 className="header-title">Register a Person for a Policy</h1>
      </header>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="fullName" className="register-label">Full Name:</label>
          <input
            type="text"
            id="fullName"
            className="register-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="register-label">Email:</label>
          <input
            type="email"
            id="email"
            className="register-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="register-label">Password:</label>
          <input
            type="password"
            id="password"
            className="register-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact" className="register-label">Contact Number:</label>
          <input
            type="text"
            id="contact"
            className="register-input"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
        </div>

        <div className="button-group">
          <button type="submit" className="register-submit-button">
            Register Person
          </button>
          <button type="button" onClick={handleBack} className="add-user-back-button">
              Back
            </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPersonPage;
