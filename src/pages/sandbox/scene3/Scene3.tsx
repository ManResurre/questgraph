import { Application, extend } from "@pixi/react";
import { Sprite, Container, Texture } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/pages/sandbox/config";
import { useAsset } from "@/hooks/useAsset";
import { useMemo } from "react";
import { createPlanetFilter } from "./CustomFilter";

extend({ Sprite, Container });

export default function Scene3() {
  const texture = useAsset<Texture>("/sandbox/earth.jpg");
  const size = 512;

  // Делаем спрайт квадратным для правильной формы круга
  const planetFilter = useMemo(
    () =>
      createPlanetFilter({ lightPos: [0.5, 0.3], spriteSize: [size, size] }),
    [size],
  );

  return (
    <Application
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      backgroundColor={0x000000}
      antialias
    >
      {texture && (
        <pixiSprite
          texture={texture}
          anchor={0.5}
          x={CANVAS_WIDTH / 2}
          y={CANVAS_HEIGHT / 2}
          width={size}
          height={size}
          filters={[planetFilter]}
        />
      )}
    </Application>
  );
}
