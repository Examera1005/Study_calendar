import React, { useState, useEffect, useRef } from "react";
import { hexToHsv, hsvToHex, hexToRgb } from "../../utils/colorUtils";

interface ColorPickerProps {
  color?: string; // Hex format, e.g. "#3b82f6"
  value?: string; // Alias for color for backward compatibility
  onChange: (hex: string) => void;
  presets?: string[];
}

const DEFAULT_PRESETS = [
  "#3b82f6", // Trust Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Royal Violet
  "#ec4899", // Rose Pink
  "#ef4444", // Crimson Red
  "#f97316", // Sunset Orange
  "#f59e0b", // Gold Amber
  "#10b981", // Emerald Green
  "#14b8a6", // Ocean Teal
  "#64748b", // Slate Gray
  "#1b1c1d", // Deep Charcoal
  "#f8fafc", // Soft White
];

export function ColorPicker({ color, value, onChange, presets = DEFAULT_PRESETS }: ColorPickerProps) {
  const activeColor = color || value || "#3b82f6";
  // Ensure we start with a clean hex format
  const normalizedColor = activeColor.startsWith("#") ? activeColor : `#${activeColor}`;
  
  // HSV representation for the picker coordinates
  const [hsv, setHsv] = useState(() => hexToHsv(normalizedColor));
  const [hexInput, setHexInput] = useState(() => normalizedColor.toUpperCase());
  
  const svContainerRef = useRef<HTMLButtonElement>(null);
  const isDragging = useRef(false);

  // Sync state if color prop changes externally (render-phase reset)
  const prevColorRef = useRef(normalizedColor);
  if (normalizedColor !== prevColorRef.current) {
    prevColorRef.current = normalizedColor;
    setHsv(hexToHsv(normalizedColor));
    setHexInput(normalizedColor.toUpperCase());
  }

  // Update both state and parent callback
  const updateColor = (newHsv: { h: number; s: number; v: number }) => {
    setHsv(newHsv);
    const hex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    setHexInput(hex.toUpperCase());
    onChange(hex);
  };

  // Drag handlers for Saturation-Value area
  const handleSVMove = (clientX: number, clientY: number) => {
    if (!svContainerRef.current) return;
    const rect = svContainerRef.current.getBoundingClientRect();
    
    // Constrain within bounds
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    
    const s = Math.round((x / rect.width) * 100);
    const v = Math.round((1 - y / rect.height) * 100);
    
    updateColor({ ...hsv, s, v });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    handleSVMove(e.clientX, e.clientY);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      handleSVMove(moveEvent.clientX, moveEvent.clientY);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    if (e.touches.length > 0) {
      handleSVMove(e.touches[0].clientX, e.touches[0].clientY);
    }

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!isDragging.current || moveEvent.touches.length === 0) return;
      handleSVMove(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
  };

  const handleHueChange = (hue: number) => {
    updateColor({ ...hsv, h: hue });
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setHexInput(val);
    
    // Check if it is a valid hex color
    const hexPattern = /^#([A-F0-9]{3}){1,2}$/i;
    if (hexPattern.test(val)) {
      const nextHsv = hexToHsv(val);
      setHsv(nextHsv);
      onChange(val.toLowerCase());
    } else if (hexPattern.test("#" + val)) {
      const nextHsv = hexToHsv("#" + val);
      setHsv(nextHsv);
      onChange(("#" + val).toLowerCase());
    }
  };

  const handlePresetSelect = (preset: string) => {
    const nextHsv = hexToHsv(preset);
    setHsv(nextHsv);
    setHexInput(preset.toUpperCase());
    onChange(preset);
  };

  // Base background for SV container represents Hue at 100% Saturation and 100% Value
  const svBackground = `hsl(${hsv.h}, 100%, 50%)`;

  return (
    <div className="color-picker-container">
      {/* Saturation-Value Picker Rectangle */}
      <button
        ref={svContainerRef}
        type="button"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={(e) => {
          let nextS = hsv.s;
          let nextV = hsv.v;
          let changed = false;
          if (e.key === "ArrowLeft") {
            nextS = Math.max(0, hsv.s - 5);
            changed = true;
          } else if (e.key === "ArrowRight") {
            nextS = Math.min(100, hsv.s + 5);
            changed = true;
          } else if (e.key === "ArrowDown") {
            nextV = Math.max(0, hsv.v - 5);
            changed = true;
          } else if (e.key === "ArrowUp") {
            nextV = Math.min(100, hsv.v + 5);
            changed = true;
          }
          if (changed) {
            e.preventDefault();
            updateColor({ ...hsv, s: nextS, v: nextV });
          }
        }}
        aria-label="Color saturation and brightness picker"
        className="color-picker-rect"
        style={{
          backgroundColor: svBackground,
        }}
      >
        {/* White overlay gradient (Saturation) */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "linear-gradient(to right, #ffffff, transparent)",
        }} />
        {/* Black overlay gradient (Value) */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "linear-gradient(to top, #000000, transparent)",
        }} />
        
        {/* Selector handle */}
        <div 
          className="color-picker-handle"
          style={{
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
            backgroundColor: normalizedColor,
            transition: isDragging.current ? "none" : "left 100ms ease, top 100ms ease",
          }} 
        />
      </button>

      {/* Hue Slider */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>
          <span>Hue</span>
          <span>{hsv.h}°</span>
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            type="range"
            min={0}
            max={360}
            value={hsv.h}
            onChange={(e) => handleHueChange(Number(e.target.value))}
            aria-label="Color hue"
            style={{
              width: "100%",
              height: 10,
              borderRadius: 5,
              background: "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
              appearance: "none",
              cursor: "pointer",
            }}
            className="color-picker-slider"
          />
        </div>
      </div>

      {/* Hexadecimal Input and Color Indicator */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: "var(--radius-sm)",
          backgroundColor: normalizedColor,
          border: "1px solid var(--border-medium)",
          boxShadow: "var(--shadow-sm)",
        }} />
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            placeholder="#3B82F6"
            aria-label="Hex color code"
            style={{
              padding: "6px 8px",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              fontFamily: "monospace",
              height: 32,
            }}
          />
        </div>
      </div>

      {/* Presets Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>PRESETS</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 8,
        }}>
          {presets.map((preset) => {
            const isSelected = normalizedColor.toLowerCase() === preset.toLowerCase();
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                aria-label={`Select color ${preset}`}
                style={{
                  backgroundColor: preset,
                  border: isSelected ? "2px solid var(--text-primary)" : "1px solid var(--border-subtle)",
                  boxShadow: isSelected ? "0 0 0 1px var(--bg-primary)" : "none",
                }}
                title={preset}
                className="color-preset-btn"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
