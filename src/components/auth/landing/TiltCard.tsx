import React, { useState, useRef } from "react";
import BorderGlow from "../../ui/BorderGlow";

const COLOR_THEMES: Record<string, { glowColor: string; colors: string[] }> = {
  "#3b82f6": {
    glowColor: "217 91% 60%",
    colors: ["#3b82f6", "#60a5fa", "#93c5fd"],
  },
  "#ef4444": {
    glowColor: "0 84% 60%",
    colors: ["#ef4444", "#f87171", "#fca5a5"],
  },
  "#10b981": {
    glowColor: "162 78% 47%",
    colors: ["#10b981", "#34d399", "#6ee7b7"],
  },
  "#f59e0b": {
    glowColor: "38 92% 50%",
    colors: ["#f59e0b", "#fbbf24", "#fcd34d"],
  },
};

// Reusable 3D Tilt Card component for premium tactile micro-interactions and custom neon glows
export function TiltCard({
  children,
  className = "",
  neonColor = "#3b82f6",
  disableTilt = false,
}: {
  children: React.ReactNode;
  className?: string;
  neonColor?: string;
  disableTilt?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disableTilt) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const maxTilt = 8; // Max tilt rotation angle in degrees

    // Weight physics: pushing the mouse down acts as weight tilt X and Y
    const rotateX = -((y - centerY) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (disableTilt) {
      setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1.01, 1.01, 1.01)");
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  const theme = COLOR_THEMES[neonColor] || {
    glowColor: "217 91% 60%",
    colors: ["#3b82f6", "#60a5fa", "#93c5fd"],
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
      }}
    >
      <BorderGlow
        className={className}
        glowColor={theme.glowColor}
        colors={theme.colors}
        backgroundColor="#120F17"
        borderRadius={disableTilt ? 16 : 12}
        fillOpacity={0.45}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transform: transform,
          transition: isHovered 
            ? "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)" 
            : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
      >
        <div style={{ transform: disableTilt ? "" : "translateZ(20px)", transformStyle: "preserve-3d", height: "100%", display: "flex", flexDirection: "column", flex: 1 }}>
          {children}
        </div>
      </BorderGlow>
    </div>
  );
}
