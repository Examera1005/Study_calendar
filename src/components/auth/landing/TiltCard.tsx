import React, { useState, useRef } from "react";

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
      <div
        className={className}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transform: transform,
          transition: isHovered 
            ? "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease, box-shadow 0.3s ease" 
            : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease",
          transformStyle: "preserve-3d",
          borderColor: isHovered ? neonColor : "",
          boxShadow: isHovered 
            ? `0 15px 35px rgba(0, 0, 0, 0.4), 0 0 20px ${neonColor}33` 
            : "",
        }}
      >
        <div style={{ transform: disableTilt ? "" : "translateZ(20px)", transformStyle: "preserve-3d", height: "100%", display: "flex", flexDirection: "column", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
