'use client'
import React from 'react';

export default function AddNewBusinessPage() {
  return (
    <div className="bg-[#002147] text-[#32CD32] min-h-screen flex flex-col items-center p-6">
      <header className="w-full text-center py-4 border-b border-[#32CD32]">
        <h1 className="text-3xl font-bold">Add New Business</h1>
        <p className="mt-2 text-lg">Streamline your workflow by adding business details efficiently.</p>
      </header>

      <main className="w-full max-w-2xl mt-8">
        <form className="bg-[#ffffff] text-[#002147] rounded-lg shadow-md p-6">
          <div className="mb-4">
            <label htmlFor="businessName" className="block text-sm font-medium mb-2">
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#32CD32]"
              placeholder="Enter the business name"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="businessType" className="block text-sm font-medium mb-2">
              Business Type
            </label>
            <select
              id="businessType"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#32CD32]"
              required
            >
              <option value="">Select a type</option>
              <option value="retail">Retail</option>
              <option value="service">Service</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="contactDetails" className="block text-sm font-medium mb-2">
              Contact Details
            </label>
            <input
              type="text"
              id="contactDetails"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#32CD32]"
              placeholder="Enter contact details"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="businessAddress" className="block text-sm font-medium mb-2">
              Business Address
            </label>
            <textarea
              id="businessAddress"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#32CD32]"
              placeholder="Enter the business address"
              rows={3}
              required
            ></textarea>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="submit"
              className="bg-[#32CD32] text-[#002147] py-2 px-6 rounded-lg font-semibold hover:bg-[#28a428] transition-all"
            >
              Submit
            </button>
            <button
              type="reset"
              className="bg-red-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-500 transition-all"
            >
              Reset
            </button>
          </div>
        </form>
      </main>

      <footer className="mt-8 text-sm text-center">
        <p>&copy; {new Date().getFullYear()} GreenLife Insurance. All rights reserved.</p>
      </footer>
    </div>
  );
}
