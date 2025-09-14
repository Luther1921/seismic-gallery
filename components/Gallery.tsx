"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Artwork = {
  id: number;
  username: string;
  image_url: string;
};

export default function Gallery() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Artwork | null>(null);
  const [confirmUsername, setConfirmUsername] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const fetchArtworks = async () => {
    const { data, error } = await supabase
      .from("artworks")
      .select("*")
      .order("id", { ascending: false });
    if (!error && data) {
      setArtworks(data);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  const confirmDelete = (art: Artwork) => {
    setDeleteTarget(art);
    setConfirmUsername("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (confirmUsername.trim() !== deleteTarget.username) {
      alert("❌ Username did not match. Deletion cancelled.");
      return;
    }

    try {
      const { error: dbError } = await supabase
        .from("artworks")
        .delete()
        .eq("id", deleteTarget.id);

      if (dbError) {
        console.error("Database delete error:", dbError.message);
        return;
      }

      const fileName = deleteTarget.image_url.split("/").pop();
      if (fileName) {
        await supabase.storage.from("gallery").remove([fileName]);
      }

      setDeleteTarget(null);
      fetchArtworks();

      setToastMessage("Artwork deleted successfully ✅");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10 w-full max-w-5xl mx-auto">
        {artworks.map((art) => (
          <div
            key={art.id}
            className="group bg-white rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1 overflow-hidden relative"
          >
            <div className="overflow-hidden">
              <img
                src={art.image_url}
                alt={art.username}
                className="w-full h-64 object-cover rounded-t-xl transform transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-3 bg-gray-50 border-t text-center">
              <a
                href={`https://x.com/${art.username.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="username-link font-semibold block"
              >
                {art.username}
              </a>
            </div>

            <button
              onClick={() => confirmDelete(art)}
              className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">
              Confirm Deletion
            </h2>

            <p className="text-sm text-gray-700 mb-3 text-center">
              To delete this artwork by{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget.username}
              </span>
              , please type the username below:
            </p>

            <input
              type="text"
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username to confirm"
            />

            <div className="flex justify-between gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 focus:ring-2 focus:ring-red-400 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md animate-fade-in">
          {toastMessage}
        </div>
      )}
    </>
  );
}
