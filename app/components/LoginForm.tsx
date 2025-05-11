"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();

  // Define roles-to-routes mapping
  const rolesToRoutes = {
    policyholder: "/policyholder/main",
    agent: "/agent/main",
    system_admin: "/system_admin/main",
    stakeholder: "/stakeholder/main",
    it_admin: "/it_admin/main",
  } as const;

  // Extract valid roles from rolesToRoutes
  type UserRole = keyof typeof rolesToRoutes;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate backend login and response with a role
    // Replace this mock response with actual backend logic
    const mockResponse = {
      email: formData.email,
      role: "agent", // Simulate role (this would come from your backend)
    };

    // Ensure the role is valid and matches one of the defined routes
    const userRole = mockResponse.role as UserRole;

    if (rolesToRoutes[userRole]) {
      const redirectRoute = rolesToRoutes[userRole];
      router.push(redirectRoute); // Redirect to the corresponding main page
    } else {
      alert("Unknown user role. Please contact support.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="login-signup-input-group">
        <label htmlFor="email" className="block text-darkBlue text-lg font-semibold mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring focus:ring-lightGreen focus:outline-none"
        />
      </div>

      <div className="login-signup-input-group">
        <label htmlFor="password" className="block text-darkBlue text-lg font-semibold mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring focus:ring-lightGreen focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="login-signup-cta-button hover:bg-[#28a745]"
      >
        Log In
      </button>
    </form>
  );
};

export default LoginForm;
