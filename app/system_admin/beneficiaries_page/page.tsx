"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Beneficiary = {
  id: number;
  fullName: string;
  relationship: string;
  dateOfBirth: string;
  createdAt: string;
  policy_number: string;
  policyHolder: {
    email: string;
  };
};

const ViewAllBeneficiariesPage = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        const res = await fetch("/api/get-beneficiaries");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch beneficiaries");

        setBeneficiaries(data.beneficiaries);
      } catch (err) {
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiaries();
  }, []);

  return (
    <div>
      <header className="style-strip">
        <h1 className="header-title">All Beneficiaries</h1>
        <div className="button-container">
          <button onClick={() => router.back()} className="back-button">Back</button>
        </div>
      </header>

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Relationship</th>
              <th>Date of Birth</th>
              <th>Policy Number</th>
              <th>Policyholder Email</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries.map((b) => (
              <tr key={b.id}>
                <td>{b.fullName}</td>
                <td>{b.relationship}</td>
                <td>{new Date(b.dateOfBirth).toLocaleDateString()}</td>
                <td>{b.policy_number}</td>
                <td>{b.policyHolder?.email}</td>
                <td>{new Date(b.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAllBeneficiariesPage;
