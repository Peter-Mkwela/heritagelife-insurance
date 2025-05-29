'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Application = {
  id: number;
  applicationNo: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  medicalCondition: string;
  preferredPremium: string;
  created_at: string;
};

const ViewApplicationPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;

      try {
        const res = await fetch(`/api/get-generated-applications?id=${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch application.');
        }

        setApplication(data);
      } catch (err) {
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  return (
    <div className="view-application-container">
      <header className="style-strip">
        <h1 className="header-title">View Generated Application</h1>
        <div className="button-container">
          <button onClick={() => router.back()} className="back-button">
            Back
          </button>
        </div>
      </header>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : application ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Application Number</th>
              <th>Full Name</th>
              <th>Date of Birth</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Medical Condition</th>
              <th>Preferred Premium</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{application.id}</td>
              <td>{application.applicationNo}</td>
              <td>{application.fullName}</td>
              <td>{new Date(application.dateOfBirth).toLocaleDateString()}</td>
              <td>{application.address}</td>
              <td>{application.phone}</td>
              <td>{application.medicalCondition}</td>
              <td>{application.preferredPremium}</td>
              <td>{new Date(application.created_at).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div>No application found.</div>
      )}
    </div>
  );
};

export default ViewApplicationPage;
export const dynamic = 'force-dynamic';
