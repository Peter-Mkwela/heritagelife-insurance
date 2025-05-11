// app/converter/page.tsx

"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import "./toimage.css";
import Link from 'next/link';

const ConverterPage = () => {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setText("");
    }
  };

  const convertImageToText = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const result = await Tesseract.recognize(URL.createObjectURL(image), "eng", {
        logger: (m) => console.log(m),
      });
      setText(result.data.text);
    } catch (error) {
      console.error("Error during OCR process:", error);
      setText("Failed, check your internet connection");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="heading">Image to Text Converter</h1>
      <div className="input-wrapper">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <button onClick={convertImageToText} disabled={!image || loading}>
          {loading ? "Converting..." : "Convert Image to Text"}
        </button>
      </div>

      {/* Back Button */}
      <Link href="/" className="back-button mt-4">
        Back to Home
      </Link>

      {text && (
        <div className="output">
          <h2 className="text-xl font-semibold mb-2">Extracted Text:</h2>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
};

export default ConverterPage;
