// /app/ocr (mock ocr test) 
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

  // These are the state variables for the extracted data
  const [policyNo, setPolicyNo] = useState<string | null>(null);
  const [deceasedName, setDeceasedName] = useState<string | null>(null);
  const [deceasedLastName, setDeceasedLastName] = useState<string | null>(null);
  const [cause, setCause] = useState<string | null>(null);
  const [DOD, setDOD] = useState<string | null>(null);

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
    formData.append("apikey", "K89337592188957"); // Replace with your actual API key
    formData.append("language", "eng");
    formData.append("OCREngine", "2");

    try {
      const response = await axios.post("https://api.ocr.space/parse/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.IsErroredOnProcessing) {
        console.error("OCR Error:", response.data.ErrorMessage);
        setError("Error during OCR processing: " + response.data.ErrorMessage.join(", "));
      } else {
        const extractedText = response.data.ParsedResults[0].ParsedText;
        setText(extractedText || "No text found. Try a clearer image.");

        // Extract the data based on keywords
        const policyMatch = extractedText.match(/Policy Number:\s*([\s\S]+?)\s*\n/);
        const deceasedNameMatch = extractedText.match(/First name of Deceased:\s*(\S+)/);
        const deceasedLastNameMatch = extractedText.match(/Last name of Deceased:\s*(\S+)/);
        const causeMatch = extractedText.match(/Cause of Death:\s*(.+)/);
        const DODMatch = extractedText.match(/Date of Death:\s*(\d{1,4}[\/\-]\d{1,2}[\/\-]\d{1,4})/);

        setPolicyNo(policyMatch ? policyMatch[1] : null);
        setDeceasedName(deceasedNameMatch ? deceasedNameMatch[1] : null);
        setDeceasedLastName(deceasedLastNameMatch ? deceasedLastNameMatch[1] : null);
        setCause(causeMatch ? causeMatch[1] : null);
        setDOD(DODMatch ? DODMatch[1] : null);
      }
    } catch (error) {
      console.error("Error during OCR request:", error);
      setError("Failed, check your internet connection.");
    }

    setLoading(false);
  };

  const generateClaim = async () => {
    if (!policyNo || !deceasedName || !deceasedLastName || !cause || !DOD) {
      setError("All fields must be filled out before generating a claim.");
      return; 
    }
  
    try {
      const claimData = {
        claimNo: `CL-${Math.floor(100000 + Math.random() * 900000)}`, // Generate claimNo
        policyNo,
        deceasedName,
        deceasedLastName,
        cause,
        DOD: new Date(DOD).toISOString(), // Convert DateTime properly
        filePath: "/public",
      };
  
      console.log("Generated Claim Data:", claimData);
  
      const response = await axios.post("/api/ocr-claim", claimData);
  
      if (response.status === 201) {
        console.log("Claim inserted successfully:", response.data);
      } else {
        console.error("Failed to insert claim:", response.data);
        setError("Failed to insert claim into the database.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while generating the claim.");
    }
  };
  
  
  

  return (
    <div className="container">
      <h1 className="heading">Image to Text Converter</h1>
      <p className="text-gray-600 mb-4">
        Supports images and PDFs. For best results with handwritten text, ensure the form is clear and scanned properly.
      </p>
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

      <Link href="/" className="back-button mt-4">Back to Home</Link>

      {error && (
        <div className="error mt-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {text && (
        <div className="output mt-4">
          <h2 className="text-xl font-semibold mb-2">Extracted Text:</h2>
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
      )}

      {policyNo && deceasedName && deceasedLastName && cause && DOD && (
        <button onClick={generateClaim} className="mt-4">
          Generate Claim
        </button>
      )}
    </div>
  );
};

export default ConverterPage;
