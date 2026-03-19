import { Application, extend } from "@pixi/react";
import { Graphics } from "pixi.js";
import { useState, useRef, useEffect } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/pages/sandbox/config";

// Регистрируем Graphics для использования в @pixi/react
extend({ Graphics });

export default function Scene2() {
  const [angle, setAngle] = useState(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      setAngle((prev) => prev + 0.02);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const circleX = CANVAS_WIDTH / 2 + Math.cos(angle) * 150;
  const circleY = CANVAS_HEIGHT / 2 + Math.sin(angle) * 150;

  const drawCircle = (g: Graphics) => {
    g.clear();
    g.circle(0, 0, 50);
    g.fill({ color: 0xff4444 });
  };

  return (
    <Application
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      backgroundColor={0x1a1a2e}
      antialias
    >
      <pixiGraphics draw={drawCircle} x={circleX} y={circleY} />
    </Application>
  );
}
