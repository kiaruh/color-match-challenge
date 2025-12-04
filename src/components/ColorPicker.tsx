'use client';

import React, { useRef, useEffect, useState } from 'react';

interface ColorPickerProps {
  onColorSelect: (color: { r: number; g: number; b: number }) => void;
  disabled?: boolean;
}

export default function ColorPicker({ onColorSelect, disabled = false }: ColorPickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [markerPosition, setMarkerPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw gradient
    // Create horizontal gradient (Hue)
    const gradientH = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradientH.addColorStop(0, 'rgb(255, 0, 0)');
    gradientH.addColorStop(0.17, 'rgb(255, 255, 0)');
    gradientH.addColorStop(0.33, 'rgb(0, 255, 0)');
    gradientH.addColorStop(0.5, 'rgb(0, 255, 255)');
    gradientH.addColorStop(0.67, 'rgb(0, 0, 255)');
    gradientH.addColorStop(0.83, 'rgb(255, 0, 255)');
    gradientH.addColorStop(1, 'rgb(255, 0, 0)');

    ctx.fillStyle = gradientH;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create vertical gradient (Lightness/Saturation overlay)
    const gradientV = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientV.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradientV.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    gradientV.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    gradientV.addColorStop(1, 'rgba(0, 0, 0, 1)');

    ctx.fillStyle = gradientV;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(x, y, 1, 1).data;
    const color = {
      r: imageData[0],
      g: imageData[1],
      b: imageData[2]
    };

    setMarkerPosition({ x, y });
    onColorSelect(color);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div
        className={`relative rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-inner)] border border-[var(--border-primary)] cursor-crosshair transition-opacity duration-200 ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-[var(--border-focus)]'}`}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          onClick={handleClick}
          className="block w-full max-w-[400px] h-auto touch-none"
        />
        {markerPosition && (
          <div
            className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-full shadow-sm pointer-events-none animate-scaleIn"
            style={{
              left: markerPosition.x,
              top: markerPosition.y,
            }}
          />
        )}
      </div>

      <p className="text-xs font-medium text-[var(--text-secondary)]">
        {disabled ? 'Color selected!' : 'Click anywhere to select a color'}
      </p>
    </div>
  );
}
