'use client';

import { useEffect, useState } from 'react';

type Profit = {
  policyType: string;  // Month Name (e.g., "January 2025")
  totalPremiums: number;
  totalClaims: number;
  netProfit: number;
};

const ProfitsPage = () => {
  const [profits, setProfits] = useState<Profit[]>([]);
  const [error, setError] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear()); // Default to current year

  useEffect(() => {
    const fetchProfits = async () => {
      try {
        const res = await fetch(`/api/get_profits?year=${year}`);
        const data = await res.json();
        if (res.ok) {
          setProfits(data.profits);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Error fetching profits');
      }
    };

    fetchProfits();
  }, [year]); // Refetch when the year changes

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="profits-container">
      <header className="style-strip">
        <h1 className="header-title">Business Profits</h1>
        <div className="button-container">
          <button onClick={handleBack} className="back-button">
            Back
          </button>
        </div>
      </header>

      {error && <p className="error-message">{error}</p>}

      <div className="filter-container">
        <label htmlFor="year">Select Year:</label>
        <select id="year" value={year} onChange={e => setYear(Number(e.target.value))}>
          {[2023, 2024, 2025, 2026].map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>
      </div>

      <div className="profits-table-container">
        <table className="profits-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Total Premiums ($)</th>
              <th>Total Claims Paid ($)</th>
              <th>Net Profit ($)</th>
            </tr>
          </thead>
          <tbody>
            {profits.map((profit, index) => (
              <tr key={index}>
                <td>{profit.policyType}</td>
                <td>${profit.totalPremiums.toFixed(2)}</td>
                <td>${profit.totalClaims.toFixed(2)}</td>
                <td>${profit.netProfit.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfitsPage;
