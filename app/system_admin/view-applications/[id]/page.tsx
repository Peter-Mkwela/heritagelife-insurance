'use client'
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";


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

  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        if (!id) return; // If 'id' is not available, do nothing.

        const res = await fetch(`/api/get-generated-applications?id=${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch application.");
        }

        setApplications([data.application]); // Fetch and set the specific application
      } catch (err) {
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [id]); // Re-run the effect when 'id' changes (e.g., when URL changes)

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="view-application-container">
      <header className="style-strip">
        <h1 className="header-title">
          {id ? "View Generated Application" : "All Generated Applications"}
        </h1>
        <div className="button-container">
          <button onClick={() => window.history.back()} className="back-button">
            Back
          </button>
        </div>
      </header>

      {applications.length > 0 ? (
        <div className="application-details">
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
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>{app.applicationNo}</td>
                  <td>{app.fullName}</td>
                  <td>{new Date(app.dateOfBirth).toLocaleDateString()}</td>
                  <td>{app.address}</td>
                  <td>{app.phone}</td>
                  <td>{app.medicalCondition}</td>
                  <td>{app.preferredPremium}</td>
                  <td>{new Date(app.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>No applications available.</div>
      )}
    </div>
  );
};

export default ViewApplicationPage;
