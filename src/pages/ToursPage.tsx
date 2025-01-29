import React from "react";
import { useNavigate } from "react-router-dom";

const ToursPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateTour = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Generate a unique ID for this tour
      const newId = Date.now().toString(); // Ensure ID is a string

      // Create a temporary URL for the image
      const objectURL = URL.createObjectURL(file);

      // Store tour data in sessionStorage
      const initialTourData = JSON.stringify({ imageUrl: objectURL, links: {} });
      sessionStorage.setItem(`tour_${newId}`, initialTourData);

      // Debugging: Log to verify it is stored
      console.log("Stored Tour Data:", sessionStorage.getItem(`tour_${newId}`));

      // Redirect to the edit page with the correct ID
      navigate(`/tours/${newId}/edit`);
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
