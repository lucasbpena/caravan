import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

// direction: true = crescente (up), false = decrescente (down), null = inactive
interface CaravanArrowP5Props {
  direction: boolean | null;
}

export function CaravanArrowP5({ direction }: CaravanArrowP5Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If direction is null, we don't render the animation
    if (!containerRef.current || direction === null) return;

    const sketch = (p: p5) => {
      let progress = 0;

      p.setup = () => {
        p.createCanvas(40, 80);
        p.noStroke();
      };

      p.draw = () => {
        p.clear();
        
        progress += 0.01; // Speed of movement
        if (progress > 1) progress = 0;

        // Visual properties
        const isUp = direction === true;
        const color = isUp ? [71, 155, 219] : [233, 137, 53]; // Green for up, Red for down
        const alpha = Math.sin(progress * Math.PI) * 255; // Fade in/out loop

        // Movement range
        const startY = isUp ? 60 : 20;
        const endY = isUp ? 20 : 60;
        const currentY = p.lerp(startY, endY, progress);

        p.push();
        p.translate(20, currentY);

        // Add Glow effect using Canvas shadow
        const ctx = (p as any).drawingContext;
        ctx.shadowBlur = 2;
        ctx.shadowColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;

        p.fill(color[0], color[1], color[2], alpha);

        // Design: Double Chevron (Modern Game UI style)
        if (isUp) {
            // Upwards Chevron
            drawChevron(p, 0, 0);
            drawChevron(p, 0, 12);
        } else {
            // Downwards Chevron
            p.rotate(p.PI);
            drawChevron(p, 0, 0);
            drawChevron(p, 0, 12);
        }

        p.pop();
      };

      // Helper function for a sleek chevron shape
      const drawChevron = (p: p5, x: number, y: number) => {
        p.beginShape();
        p.vertex(x - 12, y + 5);
        p.vertex(x, y - 5);
        p.vertex(x + 12, y + 5);
        p.vertex(x + 12, y + 10);
        p.vertex(x, y);
        p.vertex(x - 12, y + 10);
        p.endShape(p.CLOSE);
      };
    };

    const instance = new p5(sketch, containerRef.current);
    return () => instance.remove();
  }, [direction]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: "10px", 
        right: "5px",
        width: 40,
        height: 80,
        pointerEvents: "none",
        zIndex: 1000,
        filter: "drop-shadow(0px 0px 5px rgba(0,0,0,0.5))" // Extra pop against card texture
      }}
    />
  );
}