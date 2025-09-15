"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type UploadFormProps = {
  onUpload: () => void;
};

export default function UploadForm({ onUpload }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username.trim()) {
      setErrorMessage("⚠️ Please enter your X username.");
      return;
    }
    if (!file) {
      setErrorMessage("⚠️ Please select an image file to upload.");
      return;
    }

    try {
      setUploading(true);

      const filePath = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("artworks")
        .upload(filePath, file);

      if (uploadError) {
        setErrorMessage(`❌ Upload failed: ${uploadError.message}`);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("artworks")
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase.from("artworks").insert([
        {
          username: username.startsWith("@") ? username : `@${username}`,
          image_url: imageUrl,
        },
      ]);

      if (insertError) {
        setErrorMessage("❌ Could not save artwork. Please try again.");
        return;
      }

      setFile(null);
      setUsername("");
      onUpload();
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <form
      onSubmit={handleUpload}
      className="bg-white p-4 rounded-2xl shadow-md w-full max-w-4xl"
    >
      <h2 className="text-lg font-semibold mb-3 text-gray-700">
        Upload Your Art
      </h2>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
       
        <input
          type="text"
          placeholder="Enter your X username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded px-3 py-2 flex-1 min-w-[150px] text-black placeholder:text-gray-600"
        />

       
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg px-4 py-2 text-center cursor-pointer flex-1 min-w-[200px] transition ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          {file ? (
            <p className="text-sm text-gray-700 truncate">✅ {file.name}</p>
          ) : (
            <p className="text-sm text-gray-500">
              Drag & drop or{" "}
              <span className="text-blue-600 underline">browse</span>
            </p>
          )}
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* Upload Button */}
        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 min-w-[120px]"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {errorMessage && (
        <p className="text-red-600 text-sm mt-2 text-center">{errorMessage}</p>
      )}
    </form>
  );
}
