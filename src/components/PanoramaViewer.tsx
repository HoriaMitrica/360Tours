import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import World, { TourNode } from "./World"; // Import World component

const getTourData = (): Record<string, TourNode> => {
  const data = localStorage.getItem("tour_data");
  return data ? JSON.parse(data) : {};
};

const saveTourData = (tourData: Record<string, TourNode>) => {
  localStorage.setItem("tour_data", JSON.stringify(tourData));
};

const PanoramaViewer: React.FC<{ initialImage: string; tourName: string }> = ({ initialImage, tourName }) => {

  const tourData:Record<string, TourNode>=getTourData();
  const [needToSelectBackPosition, setNeedToSelectBackPosition] = useState<boolean>(false);

  const [currentNodeId, setCurrentNodeId] = useState<string>(() => {
   
    const existingNode = Object.values(tourData).find((node) => node.imageUrl === initialImage);
    if (existingNode) return existingNode.id;

    const newId = Date.now().toString();
    const newNode: TourNode = { id: newId, name: tourName, imageUrl: initialImage, arrows: [] };
    const updatedTourData = { ...tourData, [newId]: newNode };

    saveTourData(updatedTourData);
    return newId;
  });

  return (

    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {needToSelectBackPosition && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,0,0,0.8)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            fontWeight: "bold",
            zIndex: 1000,
          }}
        >
          Before continuing, choose the direction you came from (Ctrl + Click)
        </div>
      )}

      <Canvas camera={{ position: [0, 0, 0.1] }}>
        <OrbitControls enableZoom={false} enablePan={false} />
        <ambientLight intensity={2}/>
        <World
          currentNodeId={currentNodeId}
          setCurrentNodeId={setCurrentNodeId}
          setNeedToSelectBackPosition={setNeedToSelectBackPosition}
        />
      </Canvas>
    </div>
  );
};

export default PanoramaViewer;
