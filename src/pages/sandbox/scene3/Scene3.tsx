import { Application, extend, useTick } from "@pixi/react";
import { Sprite, Container, Texture } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/pages/sandbox/config";
import { useAsset } from "@/hooks/useAsset";
import { useMemo, useRef } from "react";
import { createPlanetFilter } from "./CustomFilter";

extend({ Sprite, Container });

function PlanetSprite({ texture, size }: { texture: Texture; size: number }) {
  const filterRef = useRef<ReturnType<typeof createPlanetFilter> | null>(null);

  // Создаём фильтр и сохраняем в ref
  const planetFilter = useMemo(() => {
    const filter = createPlanetFilter({
      lightPos: [0.5, 0.3],
      spriteSize: [size, size],
    });
    filterRef.current = filter;
    return filter;
  }, [size]);

  // Анимация вращения планеты
  useTick(() => {
    if (filterRef.current) {
      filterRef.current.resources.planetUniforms.uniforms.uTime += 0.1;
    }
  });

  return (
    <pixiSprite
      texture={texture}
      anchor={0.5}
      x={CANVAS_WIDTH / 2}
      y={CANVAS_HEIGHT / 2}
      width={size}
      height={size}
      filters={[planetFilter]}
    />
  );
}

export default function Scene3() {
  const texture = useAsset<Texture>("/sandbox/earth.jpg");
  const size = 512;

  return (
    <Application
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      backgroundColor={0x000000}
      antialias
    >
      {texture && <PlanetSprite texture={texture} size={size} />}
    </Application>
  );
}
