"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";



type Claim = {
  id: number;
  claimNo: string;
  policyNo: string;
  deceasedName: string;
  deceasedLastName: string;
  cause: string;
  DOD: string;
  created_at: string;
};

const ViewClaimPage = () => {
  const [claim, setClaim] = useState<Claim | null>(null);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const params = useParams(); // Extracts { id } from the URL
  const searchParams = useSearchParams();
const id = searchParams.get("id");

  useEffect(() => {
    const fetchClaim = async () => {
      if (!params.id) return;
      try {
        const res = await fetch(`/api/get-ocr-claims?id=${params.id}`);
        const data = await res.json();

        if (res.ok) {
          setClaim(data);
        } else {
          setError(data.error || "Failed to fetch claim");
        }
      } catch (err) {
        setError("Failed to fetch claim");
      }
    };

    fetchClaim();
  }, [params.id]);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="view-claim-container">
      <header className="style-strip">
        <h1 className="header-title">View Claim Details</h1>
        <div className="button-container">
          <button onClick={handleBack} className="back-button">
            Back
          </button>
        </div>
      </header>

      {error && <p className="error-message">{error}</p>}

      {claim ? (
        <div className="claim-details-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Claim Number</th>
                <th>Policy Number</th>
                <th>Deceased Name</th>
                <th>Cause of Death</th>
                <th>Date of Death</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{claim.id}</td>
                <td>{claim.claimNo}</td>
                <td>{claim.policyNo}</td>
                <td>{claim.deceasedName} {claim.deceasedLastName}</td>
                <td>{claim.cause}</td>
                <td>{new Date(claim.DOD).toLocaleDateString()}</td>
                <td>{new Date(claim.created_at).toLocaleString()}</td>

              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div>Loading claim details...</div>
      )}
    </div>
  );
};

export default ViewClaimPage;
export const dynamic = "force-dynamic";