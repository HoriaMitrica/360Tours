import React, { useEffect, useState } from "react";
import { useThree, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import SelectionMenu from "./SelectionMenu";

export type TourNode = {
  id: string;
  name: string;
  imageUrl: string;
  arrows: { position: [number, number, number]; linkedNodeId: string | null }[];
};

const getTourData = (): Record<string, TourNode> => {
  const data = localStorage.getItem("tour_data");
  return data ? JSON.parse(data) : {};
};

const saveTourData = (tourData: Record<string, TourNode>) => {
  localStorage.setItem("tour_data", JSON.stringify(tourData));
};

export const getScreenPosition = (
  point3d: [number, number, number],
  camera: THREE.Camera
): { x: number; y: number } => {
  const vec = new THREE.Vector3(point3d[0], point3d[1], point3d[2]);
  vec.project(camera);
  const x = (vec.x + 1) / 2 * window.innerWidth;
  const y = (-vec.y + 1) / 2 * window.innerHeight;
  return { x, y };
};


const World: React.FC<{
  currentNodeId: string;
  setCurrentNodeId: (id: string) => void;
  setNeedToSelectBackPosition: (state: boolean) => void;
}> = ({ currentNodeId, setCurrentNodeId, setNeedToSelectBackPosition }) => {

  const { camera, scene } = useThree();
  const [tourData, setTourData] = useState<Record<string, TourNode>>(getTourData);
  const currentNode = tourData[currentNodeId] || null;
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [previousNodeId, setPreviousNodeId] = useState<string | null>(null);
  const [backArrowNeeded, setBackArrowNeeded] = useState<boolean>(false);
  const [menuState, setMenuState] = useState<{
    visible: boolean;
    options: { label: string; value: string }[];
    selectedPoint: [number, number, number] | null;
  }>({
    visible: false,
    options: [],
    selectedPoint: null,
  });

  useEffect(() => {
    if (currentNode) {
      const loader = new THREE.TextureLoader();
      loader.load(currentNode.imageUrl, (loadedTexture) => {
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.repeat.x = -1;
        setTexture(loadedTexture);
      });
    }
  }, [currentNode]);

  useEffect(() => {
    if (!currentNode) {
      setBackArrowNeeded(false);
      setNeedToSelectBackPosition(false);
      return;
    }
    // If we have a previous node (and we're not reloading the same node)
    if (previousNodeId && currentNodeId !== previousNodeId) {
      // Check if the current node already has an arrow pointing back to the previous node.
      const hasBackArrow = currentNode.arrows.some(
        arrow => arrow.linkedNodeId === previousNodeId
      );
      if (!hasBackArrow) {
        setBackArrowNeeded(true);
        setNeedToSelectBackPosition(true);
      } else {
        setBackArrowNeeded(false);
        setNeedToSelectBackPosition(false);
      }
    } else {
      setBackArrowNeeded(false);
      setNeedToSelectBackPosition(false);
    }
  }, [currentNode, previousNodeId, currentNodeId]);


  if (!currentNode) return null;

  const handleSceneClick = (event: ThreeEvent<MouseEvent>) => {

    if (!event.ctrlKey) return;
    const mouse = new THREE.Vector2(event.pointer.x, event.pointer.y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      const clickedPoint = intersects[0].point.toArray() as [number, number, number];

      if (backArrowNeeded) {
        setBackArrowNeeded(false);
        setNeedToSelectBackPosition(false);
        setupBackArrow(clickedPoint);
      } else {
        // Prevent linking to the same node
        const availableNodes = Object.values(tourData)
          .filter(node => node.id !== currentNodeId)
          .map(node => ({ label: `📌 ${node.name}`, value: node.id }));

        setMenuState(prev => ({
          ...prev,
          visible: true,
          options: [
            { label: "➕ Add New Photo", value: "new" },
            ...(availableNodes.length > 0 ? [{ label: "🔗 Link Existing Photo", value: "link" }] : [])
          ],
          selectedPoint: clickedPoint
        }));
      }
    }
  };

  const handleMenuSelect = (option: string) => {
    setMenuState(prev => ({ ...prev, visible: false })); // Close the menu

    if (!menuState.selectedPoint) return;

    if (option === "new") {
      promptImageUpload(menuState.selectedPoint!);
    } else if (option === "link") {
      const availableNodes = Object.values(tourData)
        .filter(node => node.id !== currentNodeId) // Prevent linking to self
        .map(node => ({ label: `📌 ${node.name}`, value: node.id }));

      setMenuState(prev => ({
        ...prev,
        visible: true,
        options: availableNodes,
        selectedPoint: prev.selectedPoint
      }));
    }
  };

  const handleNodeSelection = (nodeId: string) => {
    setMenuState(prev => ({ ...prev, visible: false })); // Close menu properly

    if (!menuState.selectedPoint) return;

    setTourData(prev => {
      const currentArrows = prev[currentNodeId].arrows || [];

      const updated = {
        ...prev,
        [currentNodeId]: {
          ...prev[currentNodeId],
          arrows: [
            ...currentArrows,
            { position: menuState.selectedPoint as [number, number, number], linkedNodeId: nodeId }
          ],
        },
        // Do NOT update the target node here.
      };

      saveTourData(updated);
      return updated;
    });

    setPreviousNodeId(currentNodeId);
    setCurrentNodeId(nodeId);
    // Now that the new node has no arrow pointing back,
    setBackArrowNeeded(true);
    setNeedToSelectBackPosition(true);
  };


  const setupBackArrow = (position: [number, number, number]) => {
    if (!previousNodeId) return;

    setTourData(prev => {
      const updated = {
        ...prev,
        [currentNodeId]: {
          ...prev[currentNodeId],
          arrows: prev[currentNodeId].arrows.some(a => a.linkedNodeId === previousNodeId)
            ? prev[currentNodeId].arrows
            : [...prev[currentNodeId].arrows, { position, linkedNodeId: previousNodeId }],
        },
        [previousNodeId]: {
          ...prev[previousNodeId],
          arrows: prev[previousNodeId].arrows.some(a => a.linkedNodeId === currentNodeId)
            ? prev[previousNodeId].arrows
            : [...prev[previousNodeId].arrows, { position: position.map(p => -p) as [number, number, number], linkedNodeId: currentNodeId }],
        },
      };
      saveTourData(updated);
      return updated;
    });

    setBackArrowNeeded(false);
    setNeedToSelectBackPosition(false);
  };

  const promptImageUpload = (position: [number, number, number]) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const name = prompt("Enter a name for this location:");
      if (!name || name.trim() === "") {
        alert("Name is required.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("https://tours360.cleancodeacademy.ro/upload.php", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (data.status !== "success") {
          alert("Failed to upload image: " + (data.message || ""));
          return;
        }

        const imageUrl = data.url; // URL from the upload.php response

        const newId = Date.now().toString();
        const newNode: TourNode = {
          id: newId,
          name,
          imageUrl,
          arrows: [],
        };

        // Update tourData: add the new node and add an arrow in the current node linking to the new node.
        setTourData((prev) => {
          const currentArrows = prev[currentNodeId].arrows || [];
          const updated = {
            ...prev,
            [currentNodeId]: {
              ...prev[currentNodeId],
              arrows: [
                ...currentArrows,
                { position: position, linkedNodeId: newId }
              ],
            },
            [newId]: newNode,
          };

          saveTourData(updated);
          return updated;
        });

        setPreviousNodeId(currentNodeId);
        setCurrentNodeId(newId);
        setNeedToSelectBackPosition(true);
      } catch (error) {
        console.error("Upload error:", error);
        alert("An error occurred while uploading the image.");
      }
    };

    input.click();
  };


  const handleExportTour = async () => {
    if (!currentNodeId || !tourData[currentNodeId]) {
      alert("No tour data available.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("tourData", JSON.stringify(tourData));

      const res = await fetch("https://tours360.cleancodeacademy.ro/saveTour.php", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        const viewUrl = `https://tours360.cleancodeacademy.ro/view?tourUrl=${encodeURIComponent(data.url)}`;
        navigator.clipboard.writeText(viewUrl);
        alert(`Tour exported! Link copied: ${viewUrl}`);
      } else {
        alert("Failed to export tour.");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("An error occurred during export.");
    }
  };


  return (
    <>
      <Html fullscreen>
        {window.location.pathname.includes("edit") && (
          <button
            onClick={handleExportTour}
            style={{
              padding: "10px 15px",
              background: "blue",
              bottom: "0px",
              right: "0px",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Export Tour
          </button>
        )}
        {menuState.visible && (
          <SelectionMenu
            position={menuState.selectedPoint
              ? getScreenPosition(menuState.selectedPoint, camera)
              : { x: 0, y: 0 }}
            options={menuState.options}
            onSelect={(option) => {
              setMenuState((prev) => ({ ...prev, visible: false })); // Close menu immediately
              if (option === "new" || option === "link") {
                handleMenuSelect(option);
              } else {
                handleNodeSelection(option)
              }
            }}
            onClose={() => setMenuState((prev) => ({ ...prev, visible: false }))}
          />
        )}
      </Html>

      <group onClick={handleSceneClick}>
        {texture && (
          <mesh>
            <sphereGeometry args={[5, 60, 40]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} />
          </mesh>
        )}

        {currentNode.arrows.map((arrow, index) => (
          <mesh
            key={index}
            position={arrow.position}
            onClick={(e) => {
              e.stopPropagation();
              setPreviousNodeId(currentNodeId);
              setCurrentNodeId(arrow.linkedNodeId!);
              setNeedToSelectBackPosition(true);
            }}
          >
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial
              color="red"
              transparent={true} 
              opacity={0.75}
            />
          </mesh>
        ))}
      </group>

    </>
  );
};

export default World;
