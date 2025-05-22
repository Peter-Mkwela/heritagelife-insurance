'use client';

import React, { useEffect, useState } from "react";
import NotificationDropdown from "../../components/NotificationDropdown/page";

const PolicyholderLanding: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null); // State to store email
  
  useEffect(() => {
    const storedEmail = localStorage.getItem("policyholderEmail"); // Retrieve email from localStorage
    if (storedEmail) {
      setEmail(storedEmail); // Set email in state
    } else {
      console.log("No email found. Please login again.");
    }
  }, []);

  // Operations list
  const operations = [
    { id: 1, name: "Apply for Policy", route: "/policyholder/application" },
    { id: 2, name: "View Policy", route: "/policyholder/view_policy" },
    { id: 3, name: "Add Beneficiaries", route: "/policyholder/beneficiaries" },
    { id: 4, name: "Send Request", route: "/policyholder/requests" },
    { id: 5, name: "Claim", route: "/policyholder/make_claim" },
    { id: 6, name: "Exit", route: "/policyholder" },
  ];

  return (
    <div className="system-admin-landing">
      <header className="header-strip">
        <h1 className="header-title">Policyholder Self-Service Portal</h1>
      </header>

      {/* Ensure Notification Dropdown is at the top of the page */}
      <div className="notification-section">
        <NotificationDropdown />
      </div>

      <main className="operations-section">
        <h2 className="operations-title">Choose an Operation</h2>
        <div className="operations-row">
          {operations.map((operation) => (
            <a key={operation.id} href={operation.route} className="operation-item">
              <h3 className="operation-name">{operation.name}</h3>
            </a>
          ))}
        </div>
      </main>

      <footer className="footer-strip">
        <p>&copy; {new Date().getFullYear()} Simplified.IT All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PolicyholderLanding;
