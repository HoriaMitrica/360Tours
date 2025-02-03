import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ToursPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get("data");

    if (encodedData) {
      try {
        const decodedData = atob(encodedData);
        localStorage.setItem("tour_data", decodedData);
        alert("Tour loaded from shared link!");
      } catch (error) {
        alert("Invalid tour data.");
      }
    }
  }, []);

  const handleCreateTour = () => {
    localStorage.removeItem("tour_data");

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("https://tours360.cleancodeacademy.ro/upload.php", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (result.status !== "success") {
          alert(result.message || "File upload failed.");
          return;
        }
        const uploadedFileUrl = result.url;

        setTimeout(() => {
          const name = prompt("Enter a name for this tour:");
          if (!name || name.trim() === "") {
            alert("Tour name is required.");
            return;
          }
          const newId = Date.now().toString();
          const initialTourData = JSON.stringify({ name, imageUrl: uploadedFileUrl, links: {} });
          sessionStorage.setItem(`tour_${newId}`, initialTourData);
          navigate(`/tours/${newId}/edit`);
        }, 100);
      } catch (error) {
        alert("File upload failed.");
      }
    };

    input.click();
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>My Tours</h1>
      <button onClick={handleCreateTour}>Create Tour</button>
    </div>
  );
};

export default ToursPage;
