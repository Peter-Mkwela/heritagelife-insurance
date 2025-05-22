"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Assuming you have a way to check authentication manually (via localStorage, cookies, or another method)
    const userRole = localStorage.getItem("role"); // Example of fetching role from local storage or a cookie.

    if (userRole === "SYSTEM_ADMIN") {
      router.push("/system_admin/main");
    } else if (userRole === "AGENT") {
      router.push("/agent/main");
    } else if (userRole === "STAKEHOLDER") {
      router.push("/stakeholder/main");
    } else if (userRole === "IT_ADMIN") {
      router.push("/it_admin/main");
    } else if (userRole === "POLICY_HOLDER") {
      router.push("/policyholder/main");
    } else {
      setLoading(false);
    }
  }, [router]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  if (loading) {
    return (
      <div>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div>
      {/* Navbar */}
      <header className="w-full flex justify-between items-center px-4 py-2 bg-white shadow-lg fixed top-0 z-50 h-[80px]">
        {/* Logo */}
        <img
          src="/header/Header.png"
          alt="Heritage Life Logo"
          className="h-full object-contain"
        />

        {/* Mobile Menu Icon */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-lightGreen focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8" 
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Navigation Menu */}
        <nav
          className={`fixed top-0 right-0 h-full bg-white ${isOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 w-auto md:w-auto md:static md:translate-x-0 flex flex-col md:flex-row items-center md:space-x-6 p-6`}
        >
          {/* Close Menu Button */}
          <button
            onClick={toggleMenu}
            className="self-end text-darkBlue md:hidden"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-lightGreen"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="flex flex-col md:flex-row md:space-x-6">
            <Link href="./policyholder" className="nav-link">
              Policy Holder
            </Link>
            <Link href="./agent" className="nav-link">
              Agent
            </Link>
            <Link href="./system_admin" className="nav-link">
              System Admin
            </Link>
            <Link href="./stakeholder" className="nav-link">
              Stakeholder
            </Link>
            <Link href="./it_admin" className="nav-link">
              IT Admin
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main
        className="flex-grow mt-[80px] flex items-center justify-center px-6 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/header/back.jpeg')`,
          minHeight: "calc(100vh)", // Ensures it covers the full viewport minus the header height
        }}
      >
        <div className="text-center">
          <h2 className="animated-text">
            Welcome to Heritage Life
          </h2>
          <p className="paragraph-text">
          Streamline your insurance journey with our easy-to-use platform, designed for your convenience
          </p>
          <div className="cta-container">
            <Link href="./get-started" className="cta-button">
              Get Started
            </Link>
          </div>
        </div>
      </main>
      {/* Footer Strip */}
      <footer className="footer-strip">
        <p>&copy; {new Date().getFullYear()} Simplified.IT All rights reserved.</p>
      </footer>
    </div>
  );
}
