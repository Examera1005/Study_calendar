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
    let rotateX = -((y - centerY) / centerY) * maxTilt;
    let rotateY = ((x - centerX) / centerX) * maxTilt;

    // Edge fade-in scaling: smoothly ramp down tilt to 0 right at the card edges
    const edgePadding = 40; // 40px fade-in zone from the borders
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const clampedY = Math.max(0, Math.min(y, rect.height));
    const minDistX = Math.min(clampedX, rect.width - clampedX);
    const minDistY = Math.min(clampedY, rect.height - clampedY);
    const edgeScale = Math.max(0, Math.min(1, Math.min(minDistX, minDistY) / edgePadding));

    rotateX *= edgeScale;
    rotateY *= edgeScale;

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
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transform,
        transition: isHovered 
          ? "border-color 0.3s ease, box-shadow 0.3s ease" 
          : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease",
        transformStyle: "preserve-3d",
        borderColor: isHovered ? neonColor : "",
        boxShadow: isHovered 
          ? `0 15px 35px rgba(0, 0, 0, 0.4), 0 0 20px ${neonColor}33` 
          : "",
      }}
    >
      <div style={{ transform: disableTilt ? "" : "translateZ(20px)", transformStyle: "preserve-3d", height: "100%", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}
