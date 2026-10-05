"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
type Hotel = {
  id: number;
  user_id: string;
  hotel_name: string | null;
};
type HotelPhoto = {
  id: number;
  hotel_id: number;
  image_url: string;
  created_at: string;
};
export default function HotelPhotosPage() {
  const router = useRouter();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [photos, setPhotos] = useState<HotelPhoto[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    loadHotelAndPhotos();
  }, []);
  async function loadHotelAndPhotos() {
    setLoading(true);
    setErrorMessage("");
    const { data: userData, error: userError } =
      await supabase.auth.getUser();
    if (userError || !userData.user) {
      router.replace("/hotel/login");
      return;
    }
    const { data: hotelData, error: hotelError } = await supabase
      .from("hotels")
      .select("id, user_id, hotel_name")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (hotelError || !hotelData) {
      setErrorMessage("Your hotel account could not be found.");
      setLoading(false);
      return;
    }
    setHotel(hotelData);
    const { data: photoData, error: photoError } = await supabase
      .from("hotel_photos")
      .select("id, hotel_id, image_url, created_at")
      .eq("hotel_id", hotelData.id)
      .order("created_at", { ascending: false });
    if (photoError) {
      setErrorMessage(photoError.message);
    } else {
      setPhotos(photoData || []);
    }
    setLoading(false);
  }
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setMessage("");
    setErrorMessage("");
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setSelectedFile(null);
      setErrorMessage("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      setErrorMessage("The image must be smaller than 10 MB.");
      return;
    }
    setSelectedFile(file);
  }
  async function handleUpload() {
    if (!hotel) {
      setErrorMessage("Hotel information is not available.");
      return;
    }
    if (!selectedFile) {
      setErrorMessage("Please select an image first.");
      return;
    }
    setUploading(true);
    setMessage("");
    setErrorMessage("");
    const fileExtension =
      selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `${hotel.id}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("hotel-photos")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: selectedFile.type,
      });
    if (uploadError) {
      setErrorMessage(uploadError.message);
      setUploading(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("hotel-photos")
      .getPublicUrl(filePath);
    const { error: databaseError } = await supabase
      .from("hotel_photos")
      .insert({
        hotel_id: hotel.id,
        image_url: publicUrl,
      });
    if (databaseError) {
      await supabase.storage.from("hotel-photos").remove([filePath]);
      setErrorMessage(databaseError.message);
      setUploading(false);
      return;
    }
    setSelectedFile(null);
    setMessage("Hotel photo uploaded successfully.");
    await loadHotelAndPhotos();
    setUploading(false);
  }
  async function handleDelete(photo: HotelPhoto) {
    if (!hotel) {
      return;
    }
    const confirmed = window.confirm(
      "Are you sure you want to delete this photo?"
    );
    if (!confirmed) {
      return;
    }
    setMessage("");
    setErrorMessage("");
    const storagePrefix = `${hotel.id}/`;
    const imageUrl = photo.image_url;
    const marker = "/storage/v1/object/public/hotel-photos/";
    const markerIndex = imageUrl.indexOf(marker);
    if (markerIndex === -1) {
      setErrorMessage("The photo storage path could not be determined.");
      return;
    }
    const filePath = imageUrl.substring(
      markerIndex + marker.length
    );
    const { error: storageError } = await supabase.storage
      .from("hotel-photos")
      .remove([filePath]);
    if (storageError) {
      setErrorMessage(storageError.message);
      return;
    }
    const { error: databaseError } = await supabase
      .from("hotel_photos")
      .delete()
      .eq("id", photo.id)
      .eq("hotel_id", hotel.id);
    if (databaseError) {
      setErrorMessage(databaseError.message);
      return;
    }
    setPhotos((currentPhotos) =>
      currentPhotos.filter((item) => item.id !== photo.id)
    );
    setMessage("Photo deleted successfully.");
  }
  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fa",
        }}
      >
        <p>Loading hotel photos...</p>
      </main>
    );
  }
  if (!hotel) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "40px 20px",
          background: "#f5f7fa",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            background: "white",
            padding: "30px",
            borderRadius: "14px",
          }}
        >
          <h1>Hotel Photos</h1>
          <p>{errorMessage || "Hotel information could not be loaded."}</p>
          <button
            onClick={() => router.push("/hotel/dashboard")}
            style={{
              padding: "12px 18px",
              border: "none",
              borderRadius: "8px",
              background: "#111827",
              color: "white",
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        padding: "30px 20px 50px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Hotel Photos</h1>
            <p style={{ color: "#666" }}>
              {hotel.hotel_name || "Your Hotel"}
            </p>
          </div>
          <button
            onClick={() => router.push("/hotel/dashboard")}
            style={{
              padding: "10px 18px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              background: "white",
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </header>
        <section
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "14px",
            marginBottom: "30px",
          }}
        >
          <h2>Upload a hotel photo</h2>
          <p style={{ color: "#666" }}>
            Upload a clear photo of your hotel, rooms, facilities, or other
            property areas.
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              display: "block",
              marginTop: "20px",
              marginBottom: "15px",
            }}
          />
          {selectedFile && (
            <p style={{ color: "#444" }}>
              Selected: <strong>{selectedFile.name}</strong>
            </p>
          )}
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            style={{
              marginTop: "10px",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              background:
                uploading || !selectedFile ? "#9ca3af" : "#111827",
              color: "white",
              cursor:
                uploading || !selectedFile ? "not-allowed" : "pointer",
            }}
          >
            {uploading ? "Uploading..." : "Upload Photo"}
          </button>
          {message && (
            <p style={{ color: "green", marginTop: "15px" }}>
              {message}
            </p>
          )}
          {errorMessage && (
            <p style={{ color: "red", marginTop: "15px" }}>
              {errorMessage}
            </p>
          )}
        </section>
        <section
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "14px",
          }}
        >
          <h2>Your Hotel Photos</h2>
          {photos.length === 0 ? (
            <p style={{ color: "#666" }}>
              You have not uploaded any hotel photos yet.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "#fff",
                  }}
                >
                  <img
                    src={photo.image_url}
                    alt="Hotel"
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <div style={{ padding: "15px" }}>
                    <button
                      onClick={() => handleDelete(photo)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #dc2626",
                        borderRadius: "8px",
                        background: "white",
                        color: "#dc2626",
                        cursor: "pointer",
                      }}
                    >
                      Delete Photo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}