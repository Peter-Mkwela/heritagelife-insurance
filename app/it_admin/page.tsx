'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const SystemAdminLanding: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const pathname = usePathname(); // This will capture the current path

  // Capture the intended route directly as /system_admin (no need to go to /login anymore)
  const intendedRoute = '/it_admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, intendedRoute }), // Send the intended route
    });

    const data = await res.json();

    if (res.ok) {
      const role = data.role?.toLowerCase();
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('role', role);
      setIsAuthenticated(true); // Set the user as authenticated
    } else {
      setError(data.error || 'Login failed');
    }
  };

  const handleLogout = () => {
    // Clear the local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('role');
    
    // Reset the authentication state
    setIsAuthenticated(false);
    setUsername(''); // Clear username input field
    setPassword(''); // Clear password input field
  
    // Redirect to the blank login page (ensure the route is correct for your project)
    router.push('/it_admin'); // Make sure '/login' is the route to your blank login page
  };
  
  const handleHomeRedirect = () => {
    router.push('/'); // Navigate to the homepage
  };

  // Check authentication when the page is loaded
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const role = localStorage.getItem('role')?.toLowerCase();

      if (token && role === 'it_admin') {
        setIsAuthenticated(true); // Allow access if the role matches
      } else {
        setIsAuthenticated(false); // Deny access if no valid token or role
        router.push('/it_admin'); // Redirect to login page
      }

      setLoading(false); // Done loading
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

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

  // If authenticated, show the system admin landing page
  const operations = [
    { id: 1, name: "Add New User", route: "/it_admin/add_user" },
    { id: 2, name: "Delete User", route: "/it_admin/delete_user" },
    { id: 3, name: "System Backup", route: "/it_admin/it_backup" },
    { id: 4, name: 'Exit', route: '/', action: handleLogout },
  ];

  return (
    <div className="system-admin-landing">
      {/* Header Strip */}
      <header className="header-strip">
        <h1 className="header-title">IT Administrator Portal</h1>
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

      {/* Footer Strip */}
      <footer className="footer-strip">
        <p>&copy; {new Date().getFullYear()} Insurance Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SystemAdminLanding;
