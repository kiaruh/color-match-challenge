'use client';

import React, { useRef, useEffect, useState } from 'react';
import { rgbToHex } from '../utils/colorUtils';

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
    // We'll use white at top (lightness) to black at bottom (darkness)
    // to cover full spectrum
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
    <div className="color-picker-container">
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          onClick={handleClick}
          className={`gradient-canvas ${disabled ? 'disabled' : ''}`}
        />
        {markerPosition && (
          <div
            className="selection-marker"
            style={{
              left: markerPosition.x,
              top: markerPosition.y,
              backgroundColor: `rgb(${
                // Invert color for visibility or just use white/black border
                'transparent'
                })`
            }}
          />
        )}
      </div>

      <p className="instruction-text">
        {disabled ? 'Color selected!' : 'Click anywhere on the gradient to select your color'}
      </p>

      <style jsx>{`
        .color-picker-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
          width: 100%;
        }

        .canvas-wrapper {
          position: relative;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          border: 2px solid var(--color-border);
          cursor: crosshair;
        }

        .gradient-canvas {
          display: block;
          width: 100%;
          max-width: 400px;
          height: auto;
          touch-action: none;
        }

        .gradient-canvas.disabled {
          cursor: not-allowed;
          opacity: 0.8;
        }

        .selection-marker {
          position: absolute;
          width: 20px;
          height: 20px;
          transform: translate(-50%, -50%);
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(0,0,0,0.5);
          pointer-events: none;
          animation: scaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .instruction-text {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .gradient-canvas {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
