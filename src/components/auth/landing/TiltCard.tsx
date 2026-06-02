import React, { useState, useEffect, useRef } from "react";

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

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (disableTilt) {
      setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1.01, 1.01, 1.01)");
    }
  };

  useEffect(() => {
    if (!isHovered || disableTilt) return;

    const card = cardRef.current;
    if (!card) return;

    // Cache the flat bounding rect once when hover starts to avoid 3D feedback loops
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      // Calculate distance outside card boundaries
      const distX = Math.max(0, Math.abs(dx) - halfW);
      const distY = Math.max(0, Math.abs(dy) - halfH);
      const distanceOutside = Math.sqrt(distX * distX + distY * distY);

      const fadeDistance = 120; // 120px fade-out distance outside the card

      if (distanceOutside >= fadeDistance) {
        setIsHovered(false);
        setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
        return;
      }

      // Smooth scale from 1 (at card edge) to 0 (at fadeDistance outside)
      const scale = 1 - distanceOutside / fadeDistance;

      // Clamp normalized coordinates inside card to [-1, 1]
      const normX = Math.max(-1, Math.min(1, dx / halfW));
      const normY = Math.max(-1, Math.min(1, dy / halfH));

      const maxTilt = 8; // Max tilt rotation angle in degrees
      const rotateX = -normY * maxTilt * scale;
      const rotateY = normX * maxTilt * scale;

      const scalePop = 1 + 0.02 * scale; // scales from 1.02 to 1.0

      setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scalePop.toFixed(3)}, ${scalePop.toFixed(3)}, ${scalePop.toFixed(3)})`);
    };

    const handleMouseLeaveWindow = () => {
      setIsHovered(false);
      setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseleave", handleMouseLeaveWindow);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeaveWindow);
    };
  }, [isHovered, disableTilt]);

  const handleMouseLeave = () => {
    if (disableTilt) {
      setIsHovered(false);
      setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    }
  };

  return (
    <div
      ref={cardRef}
      className={className}
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
