"use client";

import { useState } from "react";
import UploadForm from "../components/UploadForm";
import Gallery from "../components/Gallery";

export default function Page() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4">
      {/* HEADER */}
      <div className="flex flex-col items-center text-center mb-10">
        <img
          src="/seismic-logo.jpeg"
          alt="Seismic Logo"
          className="w-24 h-24 mb-4 rounded-full shadow-md"
        />
        <h1 className="text-3xl font-bold text-gray-800">
          Seismic Art Gallery
        </h1>
        <p className="text-gray-600 mt-2 max-w-md">
          Showcase your creative art for the Seismic Community
        </p>
        <a
          href="https://x.com/Mota_kidah"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 text-sm text-blue-500 hover:underline"
        >
          Built by @Mota_kidah
        </a>
      </div>

      {/* UPLOAD FORM */}
      <UploadForm onUpload={() => setRefresh((prev) => prev + 1)} />

      {/* GALLERY */}
      <Gallery key={refresh} />
    </div>
  );
}
