
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Get application ID from URL
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true); // Start loading state
      try {
        let url = id
          ? "/api/get-generated-applications"
          : "/api/get-all-generated-applications";

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch applications.");
        }

        setApplications(id ? [data.application] : data.applications);
      } catch (err) {
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [id]); // Only re-run when id changes (including refresh)

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="track-business-container">
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
        <div className="table-container">
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
