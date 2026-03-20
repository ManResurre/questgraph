import { useEffect, useState } from "react";
import { Assets } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/pages/sandbox/config";

/**
 * Фон космоса в стиле Starsector
 *
 * @remarks
 * Использует текстуру туманности/космоса как в игре Starsector
 */
export function StarsectorBackground() {
  const [texture, setTexture] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    Assets.load("/sandbox/background2.jpg")
      .then((texture) => {
        if (!cancelled) {
          setTexture(texture);
        }
      })
      .catch((err) => {
        console.error("Failed to load background texture:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!texture) return null;

  return (
    <pixiSprite
      texture={texture}
      x={0}
      y={0}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      anchor={0}
    />
  );
}
