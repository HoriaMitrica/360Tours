import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PanoramaViewer from "../components/PanoramaViewer";

interface TourData {
  name: string;
  imageUrl: string;
}

const EditTourPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tourData, setTourData] = useState<TourData | null>(null);

  useEffect(() => {
    if (!id) {
      alert("Invalid tour ID. Redirecting...");
      navigate("/tours");
      return;
    }

    const storedData = sessionStorage.getItem(`tour_${id}`);
    if (storedData) {
      setTourData(JSON.parse(storedData));
    } else {
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
            navigate("/tours");
            return;
          }
          const uploadedFileUrl = result.url;
          const name = prompt("Enter a name for this tour:");
          if (!name || name.trim() === "") {
            alert("Tour name is required.");
            navigate("/tours");
            return;
          }
          const newTourData: TourData = { name, imageUrl: uploadedFileUrl };
          sessionStorage.setItem(`tour_${id}`, JSON.stringify(newTourData));
          setTourData(newTourData);
        } catch (error) {
          alert("File upload failed.");
          navigate("/tours");
        }
      };

      input.click();
    }
  }, [id, navigate]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {tourData ? (
        <PanoramaViewer initialImage={tourData.imageUrl} tourName={tourData.name} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default EditTourPage;
