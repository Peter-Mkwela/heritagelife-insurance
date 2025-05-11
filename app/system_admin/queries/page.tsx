'use client';
import { useEffect, useState } from 'react';

type Query = {
  id: number;
  senderEmail: string;
  message: string;
  created_at: string;
  resolved: boolean; // Tracks whether the query has been resolved
};

const QueriesPage = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch all queries from the backend
  useEffect(() => {
    const fetchQueries = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/get_queries');

        if (!res.ok) {
          const errorData = await res.json();
          setError(errorData.message || 'Failed to fetch queries');
          return;
        }

        const data = await res.json();
        setQueries(data || []);
      } catch (err) {
        setError('Error fetching queries');
      } finally {
        setLoading(false);
      }
    };

    fetchQueries();
  }, []);

  // Handle resolving a query
  const handleResolveQuery = async (id: number, email: string) => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/resolve_query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, email }),
      });

      if (res.ok) {
        // Update the resolved status of the specific query
        setQueries((prevQueries) =>
          prevQueries.map((query) =>
            query.id === id ? { ...query, resolved: true } : query
          )
        );
        setSuccessMessage('Query resolved successfully.');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to resolve the query.');
      }
    } catch {
      setError('Error resolving the query.');
    } finally {
      setLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div>
      <header className="style-strip">
        <h1 className="header-title">Queries from Policyholders</h1>
        <div className="button-container">
          <button onClick={handleBack} className="back-button">
            Back
          </button>
        </div>
      </header>

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="queries-container">
        {queries.length === 0 ? (
          <p>No queries found.</p>
        ) : (
          <div className="chat-queries-list">
            {queries.map((query) => (
              <div key={query.id} className="chat-message">
                <p>
                  <strong>Email:</strong> {query.senderEmail}
                </p>
                <p>
                  <strong>Message:</strong> {query.message}
                </p>
                <p>
                  <strong>Date Submitted:</strong>{' '}
                  {new Date(query.created_at).toLocaleString()}
                </p>
                <button
                  onClick={() => handleResolveQuery(query.id, query.senderEmail)}
                  className={`resolve-button ${
                    query.resolved ? 'resolved' : ''
                  }`}
                  disabled={query.resolved}
                  style={
                    query.resolved
                      ? {
                          backgroundColor: 'blue',
                          color: 'white',
                          cursor: 'default',
                        }
                      : {}
                  }
                >
                  {query.resolved ? 'Resolved' : 'Resolve'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueriesPage;
