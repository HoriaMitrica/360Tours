import React, { useState } from "react";

export type SelectionMenuProps = {
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  onClose: () => void;
  allowConfirm?: boolean;
  position: { x: number; y: number };
};

const SelectionMenu: React.FC<SelectionMenuProps> = ({
  options,
  onSelect,
  onClose,
  allowConfirm = true,
  position,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: "rgba(0, 0, 0, 0.8)",
        padding: "10px",
        borderRadius: "5px",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
      }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setSelectedValue(option.value)}
          style={{
            color: "white",
            background: "transparent",
            border: "none",
            padding: "5px",
            fontWeight: selectedValue === option.value ? "bold" : "normal",
          }}
        >
          {option.label}
        </button>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <button
          onClick={onClose}
          style={{
            color: "white",
            background: "red",
            padding: "5px",
            borderRadius: "5px",
          }}
        >
          Cancel
        </button>
        {allowConfirm && (
          <button
            onClick={() => {
              if (selectedValue) onSelect(selectedValue);
            }}
            style={{
              color: "white",
              background: "green",
              padding: "5px",
              borderRadius: "5px",
            }}
            disabled={!selectedValue}
          >
            Confirm
          </button>
        )}
      </div>
    </div>
  );
};

export default SelectionMenu;
