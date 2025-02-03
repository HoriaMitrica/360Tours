import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PanoramaViewer from "../components/PanoramaViewer";

type TourNode = {
  id: string;
  name: string;
  imageUrl: string;
  arrows: { position: [number, number, number]; linkedNodeId: string | null }[];
};

const ViewTourPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tourUrl = searchParams.get("tourUrl");

  // We now store the starting node from the exported tour dictionary.
  const [tourData, setTourData] = useState<TourNode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tourUrl) {
      setError("Invalid tour link!");
      setLoading(false);
      return;
    }

    const fetchTour = async () => {
      try {
        const response = await fetch(tourUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch tour: ${response.statusText}`);
        }

        const data = await response.json();

        // data is expected to be a dictionary of nodes.
        if (typeof data !== "object" || Object.keys(data).length === 0) {
          throw new Error("Invalid tour data received.");
        }

        // Save the entire tour dictionary to localStorage
        localStorage.setItem("tour_data", JSON.stringify(data));

        // Choose a starting node (e.g., the first node in the dictionary)
        const firstKey = Object.keys(data)[0];
        const startingNode = data[firstKey];

        if (!startingNode.imageUrl || !startingNode.name) {
          throw new Error("Invalid tour data received.");
        }

        setTourData(startingNode);
      } catch (err) {
        console.error("Error loading tour:", err);
        setError("Failed to load the tour. Please check the link.");
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [tourUrl]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {loading ? (
        <p>Loading tour...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : tourData ? (
        <PanoramaViewer initialImage={tourData.imageUrl} tourName={tourData.name} />
      ) : (
        <p>No tour data available.</p>
      )}
    </div>
  );
};

export default ViewTourPage;
