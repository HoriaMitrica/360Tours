import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PanoramaViewer from "../components/PanoramaViewer";

const EditTourPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get tour ID from URL
  const navigate = useNavigate();
  const [tourData, setTourData] = useState<{ imageUrl: string } | null>(null);

  useEffect(() => {
    if (!id) {
      alert("Invalid tour ID. Redirecting...");
      navigate("/tours");
      return;
    }

    // Debugging: Check if ID is received correctly
    console.log("Received Tour ID:", id);

    // Retrieve stored tour data
    const storedData = sessionStorage.getItem(`tour_${id}`);

    // Debugging: Check if data exists
    console.log("Retrieved Tour Data:", storedData);

    if (!storedData) {
      alert("No tour found. Redirecting...");
      navigate("/tours");
    } else {
      setTourData(JSON.parse(storedData));
    }
  }, [id, navigate]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {tourData ? <PanoramaViewer initialImage={tourData.imageUrl} /> : <p>Loading...</p>}
    </div>
  );
};

export default EditTourPage;
