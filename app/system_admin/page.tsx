'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';

const SystemAdminLanding: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const intendedRoute = '/system_admin';

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const role = localStorage.getItem('role')?.toLowerCase();
  
      if (token && role === 'system_admin') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push('/system_admin'); 
      }
      setLoading(false);
    };
  
    checkAuth();
  }, [router]); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Please complete the CAPTCHA.');
      return;
    }

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, intendedRoute, captchaToken }),
    });

    const data = await res.json();

    if (res.ok) {
      const role = data.role?.toLowerCase();
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('role', role);
      setIsAuthenticated(true);
    } else {
      setError(data.error || 'Login failed');
      recaptchaRef.current?.reset();
      setCaptchaToken('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    router.push('/system_admin');
  };

  const handleHomeRedirect = () => {
    router.push('/');
  };

  // ✅ Prevent anything from rendering before auth is checked
  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  // 🚪 Not authenticated: Show login form
  if (!isAuthenticated) {
    return (
      <div className="policy-container">
        <div className="login-form-container">
          <h1 className="policy-heading">Login to Your Account</h1>
          <p className="description">Please enter your credentials to log in.</p>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username :</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password :</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={(token) => setCaptchaToken(token || '')}
              ref={recaptchaRef}
            />

            {error && <p className="error-message">{error}</p>}
            <div className="button-group">
              <button type="submit" className="cta-button cta-button-login">
                Login
              </button>
              <button
                type="button"
                onClick={handleHomeRedirect}
                className="cta-button cta-button-back-home"
              >
                Home
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ✅ Authenticated: Show dashboard
  const operations = [
    { id: 1, name: 'Policy Application', route: '/system_admin/policy_application' },
    { id: 2, name: 'Queries', route: '/system_admin/queries' },
    { id: 3, name: 'Cancel Policy', route: '/system_admin/cancel_policy' },
    { id: 4, name: 'Process Claim', route: '/system_admin/process_claim' },
    { id: 5, name: 'Modify Policy', route: '/system_admin/modify_policy' },
    { id: 6, name: 'Generated Claims', route: '/system_admin/view-all-claims' },
    { id: 7, name: 'Generated Applications', route: '/system_admin/view-all-applications' },
    { id: 8, name: 'Beneficiaries', route: '/system_admin/beneficiaries_page' },
    { id: 9, name: 'Exit', route: '/', action: handleLogout },
  ];

  return (
    <div className="system-admin-landing">
      <header className="header-strip">
        <h1 className="header-title">System Admin Portal</h1>
      </header>

      <main className="operations-section">
        <h2 className="operations-title">Choose an Operation</h2>
        <div className="operations-row">
          {operations.map((operation) => (
            <button
              key={operation.id}
              onClick={operation.action || (() => router.push(operation.route))}
              className="operation-item"
            >
              <h3 className="operation-name">{operation.name}</h3>
            </button>
          ))}
        </div>
      </main>

      <footer className="footer-strip">
        <p>&copy; {new Date().getFullYear()} Simplified.IT All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SystemAdminLanding;
