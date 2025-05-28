'use client';

import React from 'react';

interface CustomUploadButtonProps {
  onFileSelected: (file: File) => void;
}

const CustomUploadButton: React.FC<CustomUploadButtonProps> = ({ onFileSelected }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <input
      type="file"
      accept="application/pdf,image/*"
      onChange={handleChange}
    />
  );
};

export default CustomUploadButton;
