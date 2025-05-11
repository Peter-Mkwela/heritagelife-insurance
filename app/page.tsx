// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();

      if (session?.user.role === "SYSTEM_ADMIN") {
        router.push("/system_admin/main");
      } else if (session?.user.role === "AGENT") {
        router.push("/agent/main");
      } else if (session?.user.role === "STAKEHOLDER") {
        router.push("/stakeholder/main");
      } else if (session?.user.role === "IT_ADMIN") {
        router.push("/it_admin/main");
      } else if (session?.user.role === "POLICY_HOLDER") {
        router.push("/policyholder/main");
      } else {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-darkBlue text-lightGreen">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="h-screen bg-darkBlue text-white flex flex-col font-sans">
      {/* Navbar */}
      <header className="w-full flex justify-between items-center px-6 py-4 bg-darkBlue shadow-lg fixed top-0 z-50">
        <h1 className="text-3xl font-bold text-lightGreen">Heritage Life</h1>

        {/* Mobile Menu Icon */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-lightGreen focus:outline-none"
        >
          <svg
            className="w-8 h-8"
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

        {/* Right-aligned Navbar Links */}
        <nav
          className={`fixed top-0 right-0 h-full bg-darkBlue shadow-lg transform ${
            isOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 w-auto md:w-auto md:static md:translate-x-0 flex flex-col md:flex-row items-center md:space-x-6 md:space-y-0 space-y-4 md:space-y-0 p-6`}
        >
          <button
            onClick={toggleMenu}
            className="self-end text-lightGreen md:hidden"
          >
            {/* Close Icon */}
            <svg
              className="w-6 h-6"
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
            <Link href="./claim" className="nav-link">
              Tesseract
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow mt-20 md:mt-0 text-center flex flex-col items-center justify-center px-6">
        <h2 className="animated-text text-5xl md:text-6xl font-extrabold leading-tight text-lightGreen mb-6">
          Welcome to Heritage Life
        </h2>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          Streamline your insurance experience with advanced AI-powered
          solutions designed for efficiency and ease.
        </p>
        <div className="mt-8">
          <Link href="#" className="cta-button">
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}
