'use client';

import { useEffect, useState } from 'react';

type NewBusiness = {
  applicationNo: string;
  fullName: string;
  preferredPremium: string;
  created_at: string;
};

const ViewNewBusinessPage = () => {
  const [newBusiness, setNewBusiness] = useState<NewBusiness[]>([]);
  const [error, setError] = useState<string>("");
  const [days, setDays] = useState<number>(30);

  useEffect(() => {
    const fetchNewBusiness = async () => {
      try {
        const res = await fetch(`/api/get_new_business?days=${days}`);
        const data = await res.json();
        if (res.ok) {
          setNewBusiness(data.newBusiness);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Error fetching new business data");
      }
    };

    fetchNewBusiness();
  }, [days]);
  const handleBack = () => {
    window.history.back();
  };
  return (
    <div className="new-business-container">
      <header className="style-strip">
        <h1 className="header-title">View New Business</h1>
        <div className="button-container">
          <button onClick={handleBack} className="back-button">
            Back
          </button>
        </div>
      </header>

      {error && <p className="error-message">{error}</p>}

      <div className="filter-container">
        <label htmlFor="days">Show registrations from the last: </label>
        <select id="days" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>7 days</option>
          <option value={15}>15 days</option>
          <option value={30}>30 days</option>
          <option value={60}>60 days</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Application No</th>
              <th>Full Name</th>
              <th>Preferred Premium</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {newBusiness.map((business) => (
              <tr key={business.applicationNo}>
                <td>{business.applicationNo}</td>
                <td>{business.fullName}</td>
                <td>${business.preferredPremium}</td>
                <td>{new Date(business.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewNewBusinessPage;
