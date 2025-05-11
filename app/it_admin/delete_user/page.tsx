'use client'
import { useEffect, useState } from 'react';

type User = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
};

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/get_users');
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch users');
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: number) => {
    try {
      const res = await fetch('/api/delete_user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('User deleted successfully');
        setUsers(users.filter(user => user.id !== id)); // Remove the user from the list
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleBack = () => {
    // Navigate to IT Admin dashboard or the previous page
    window.history.back();
  };

  return (
    <div className="users-container">
            {/* Header Strip */}
            <header className="style-strip">
        <h1 className="header-title">Manage Users</h1>
        <div className="button-container">
          <button onClick={handleBack} className="back-button">
            Back
          </button>
        </div>
      </header>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.full_name}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleDeleteUser(user.id)} className="delete-button">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
