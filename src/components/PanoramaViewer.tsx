import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

type Direction = "front" | "left" | "right" | "back";

type TourNode = {
  imageUrl: string;
  links: Partial<Record<Direction, TourNode>>;
};

const ARROW_POSITIONS: Record<Direction, [number, number, number]> = {
  front: [0, 0, -3],
  left: [-3, 0, 0],
  right: [3, 0, 0],
  back: [0, 0, 3],
};

const PanoramaViewer: React.FC<{ initialImage: string }> = ({ initialImage }) => {
  const [currentNode, setCurrentNode] = useState<TourNode>({
    imageUrl: initialImage,
    links: {},
  });
  const [history, setHistory] = useState<TourNode[]>([]);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    // Load texture asynchronously to prevent React from suspending
    const loader = new THREE.TextureLoader();
    loader.load(currentNode.imageUrl, (loadedTexture) => {
      loadedTexture.wrapS = THREE.RepeatWrapping;
      loadedTexture.repeat.x = -1;
      setTexture(loadedTexture);
    });
  }, [currentNode.imageUrl]);

  const handleArrowClick = (direction: Direction) => {
    if (currentNode.links[direction]) {
      setHistory((prev) => [...prev, currentNode]);
      setCurrentNode(currentNode.links[direction]!);
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const objectURL = URL.createObjectURL(file);
        const newNode: TourNode = { imageUrl: objectURL, links: { back: currentNode } };

        setCurrentNode((prev) => ({
          ...prev,
          links: { ...prev.links, [direction]: newNode },
        }));

        setHistory((prev) => [...prev, currentNode]);
        setCurrentNode(newNode);
      };
      input.click();
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 0.1] }}>
        <OrbitControls enableZoom={false} enablePan={false} />

        {texture && (
          <mesh>
            <sphereGeometry args={[5, 60, 40]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} />
          </mesh>
        )}

        {/* 3D Navigation Arrows */}
        {(["front", "left", "right", "back"] as Direction[]).map((dir) => (
          <mesh
            key={dir}
            position={ARROW_POSITIONS[dir]}
            onClick={() => handleArrowClick(dir)}
          >
            <coneGeometry args={[0.3, 0.7, 12]} />
            <meshStandardMaterial color={currentNode.links[dir] ? "green" : "gray"} />
            <Text position={[0, 0.6, 0]} fontSize={0.3} color="white">
              {dir.toUpperCase()}
            </Text>
          </mesh>
        ))}
      </Canvas>
    </div>
  );
};

export default PanoramaViewer;
