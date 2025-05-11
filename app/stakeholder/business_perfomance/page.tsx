'use client';

import { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type PerformanceData = {
  month: string;
  premiums: number;
  claims: number;
  profit: number;
};

const PerformancePage = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const res = await fetch('/api/get_performance');
        const data = await res.json();
        if (res.ok) {
          setPerformanceData(data.performance);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Error fetching performance data');
      }
    };

    fetchPerformanceData();
  }, []);

  // Prepare data for charts
  const months = performanceData.map(data => data.month);
  const premiums = performanceData.map(data => data.premiums);
  const claims = performanceData.map(data => data.claims);
  const profits = performanceData.map(data => data.profit);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="performance-container">
      <header className="style-strip">
        <h1 className="header-title">Business Performance</h1>
        <div className="button-container">
          <button onClick={handleBack} className="back-button">
            Back
          </button>
        </div>
      </header>

      {error && <p className="error-message">{error}</p>}

      <div className="chart-container">
        {/* Line Chart for Premiums and Claims */}
        <div className="chart">
          <h2>Monthly Premiums vs Claims</h2>
          <Line
            data={{
              labels: months,
              datasets: [
                {
                  label: 'Premiums ($)',
                  data: premiums,
                  borderColor: '#32CD32',
                  backgroundColor: 'rgba(50, 205, 50, 0.2)',
                  tension: 0.3,
                },
                {
                  label: 'Claims ($)',
                  data: claims,
                  borderColor: '#FF0000',
                  backgroundColor: 'rgba(255, 0, 0, 0.2)',
                  tension: 0.3,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Monthly Premiums vs Claims',
                },
              },
            }}
          />
        </div>

        {/* Bar Chart for Profit */}
        <div className="chart">
          <h2>Monthly Profits</h2>
          <Bar
            data={{
              labels: months,
              datasets: [
                {
                  label: 'Profit ($)',
                  data: profits,
                  backgroundColor: '#002147',
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Monthly Profits',
                },
              },
            }}
          />
        </div>

        {/* Pie Chart for Claims vs Premiums */}
        <div className="chart">
          <h2>Premiums vs Claims Distribution</h2>
          <Pie
            data={{
              labels: ['Premiums', 'Claims'],
              datasets: [
                {
                  data: [premiums.reduce((a, b) => a + b, 0), claims.reduce((a, b) => a + b, 0)],
                  backgroundColor: ['#32CD32', '#FF0000'],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Premiums vs Claims Distribution',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
