"use client";

import { useState } from "react";
import axios from "axios";
import "./toimage.css";
import Link from 'next/link';

const ConverterPage = () => {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setText("");
      setError("");
    }
  };

  const convertImageToText = async () => {
    if (!image) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", image);
    formData.append("apikey", "K89337592188957");  // Replace with your API key
    formData.append("language", "eng");

    try {
      const response = await axios.post("https://api.ocr.space/parse/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.IsErroredOnProcessing) {
        setError("Error during OCR processing.");
      } else {
        setText(response.data.ParsedResults[0].ParsedText);
      }
    } catch (error) {
      setError("Failed, check your internet connection.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="heading">Image to Text Converter</h1>
      <div className="input-wrapper">
        <input
          type="file"
          accept="image/*, application/pdf"
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

      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

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
