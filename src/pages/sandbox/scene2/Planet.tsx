import {extend, useTick} from "@pixi/react";
import {
    Assets,
    Texture,
    Text,
    TilingSprite as PixiTilingSprite,
    Graphics as PixiGraphics,
    Container as PixiContainer, UPDATE_PRIORITY, TilingSprite, FillGradient,
    Filter, GlProgram, Container, Graphics, Sprite, BlurFilter
} from "pixi.js";
import {useEffect, useState, useCallback, useRef, RefAttributes, ReactNode, Key, useMemo} from "react";
import { GlowFilter } from 'pixi-filters';
import {BLEND_MODES} from "pixi.js/lib/rendering/renderers/shared/state/const";

type PixiComponentProps<T> = Partial<T> & RefAttributes<T> & {
    children?: ReactNode;
    key?: Key;
};

declare global {
    namespace JSX {
        interface IntrinsicElements {
            pixiContainer: PixiComponentProps<Container>;
            pixiTilingSprite: PixiComponentProps<TilingSprite>;
            pixiSprite: PixiComponentProps<Sprite>;
            pixiText: PixiComponentProps<Text>;

            pixiGraphics: PixiComponentProps<Graphics> & {
                draw?: (g: Graphics) => void;
            };
        }
    }
}

// export class LensDistortionFilter extends Filter {
//     constructor(strength = 0.2) {
//
//         const vertex = `...`;
//         const fragment = `...`;
//
//         const glProgram = new GlProgram({ vertex, fragment });
//
//         super({
//             glProgram,
//             resources: {
//                 strength: { value: strength }
//             }
//         });
//     }
// }

interface PlanetProps {
    texturePath: string;
    radius?: number;
    x?: number;
    y?: number;
    rotationSpeed?: number;
}

// Регистрируем Pixi-классы как JSX-компоненты
extend({
    Container: PixiContainer,
    Graphics: PixiGraphics,
    TilingSprite: PixiTilingSprite,
});

function createPlanetTexture(
    radius: number,
    azimuth: number = -Math.PI / 3,
    elevation: number = Math.PI * 2,
    softness: number = 0.2,
    lightColor: string = "#f9e0b0",
    shadowColor: string = "#5a3e2a",
    terminator: number = 0.4
): Texture {
    const size = radius * 2;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    const cx = radius;
    const cy = radius;

    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    const lightR = parseInt(lightColor.slice(1, 3), 16);
    const lightG = parseInt(lightColor.slice(3, 5), 16);
    const lightB = parseInt(lightColor.slice(5, 7), 16);
    const shadowR = parseInt(shadowColor.slice(1, 3), 16);
    const shadowG = parseInt(shadowColor.slice(3, 5), 16);
    const shadowB = parseInt(shadowColor.slice(5, 7), 16);

    // ⭐ 3D-вектор света
    const lx = Math.cos(elevation) * Math.sin(azimuth);
    const ly = Math.sin(elevation);
    const lz = Math.cos(elevation) * Math.cos(azimuth);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.hypot(dx, dy);
            const idx = (y * size + x) * 4;

            if (dist > radius) {
                data[idx + 3] = 0;
                continue;
            }

            // ⭐ нормаль к сфере
            const nx = dx / radius;
            const ny = dy / radius;
            const nz = Math.sqrt(1 - nx * nx - ny * ny);

            // ⭐ освещение: dot = N·L
            let dot = nx * lx + ny * ly + nz * lz;

            dot -= terminator;

            let intensity = (dot + 1) / 2;

            // мягкость терминатора
            if (softness > 0) {
                const t = (intensity - 0.5) / softness;
                intensity = 1 / (1 + Math.exp(-t * 8));
            }

            // затемнение края
            const edgeDarkening = 1 - (dist / radius) * 0.1;
            intensity = Math.min(1, Math.max(0, intensity * edgeDarkening));

            data[idx] = Math.round(lightR * intensity + shadowR * (1 - intensity));
            data[idx + 1] = Math.round(lightG * intensity + shadowG * (1 - intensity));
            data[idx + 2] = Math.round(lightB * intensity + shadowB * (1 - intensity));
            data[idx + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // ⭐⭐⭐ Атмосферное сияние (самый красивый вариант)
    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < 3; i++) {
        const r1 = radius * (1.05 + i * 0.05);
        const r2 = radius * (1.15 + i * 0.05);

        const grad = ctx.createRadialGradient(cx, cy, r1, cx, cy, r2);

        grad.addColorStop(0.0, "rgba(120, 180, 255, 0.15)");
        grad.addColorStop(1.0, "rgba(120, 180, 255, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";

    return Texture.from(canvas);
}


export function Planet(
    {
        texturePath,
        radius = 80,
        x = 0,
        y = 0,
        rotationSpeed = 0.1,
    }: PlanetProps) {

    const [texture, setTexture] = useState<Texture | null>(null);
    // const [lensFilter, setLensFilter] = useState<LensDistortionFilter>();

    const [maskGraphics, setMaskGraphics] = useState<PixiGraphics | null>(null);
    const spriteRef = useRef<TilingSprite>(null);
    const [shadowTexture, setShadowTexture] = useState<Texture | null>(null);

    const blurFilter = useMemo(() => new BlurFilter(20), []);
    const glowFilter = useMemo(
        () => new GlowFilter({
            distance: 10,           // радиус свечения (пиксели)
            outerStrength: 4,       // интенсивность внешнего свечения
            innerStrength: 0,       // интенсивность внутреннего свечения (0 = только внешнее)
            color: 0x66b7ff,        // цвет свечения (голубой)
            quality: 0.2,           // качество (0..1, выше = медленнее)
        }),
        []
    );

    useTick({
        callback() {
            if (this.current) {
                this.current.tilePosition.x += 0.2;
                // console.log(this.current);
            }
        },
        context: spriteRef,
        isEnabled: true,
        priority: UPDATE_PRIORITY.HIGH,
    })

    useEffect(() => {
        setShadowTexture(createPlanetTexture(radius));
    }, [radius]);

    // загрузка текстуры
    useEffect(() => {
        let cancelled = false;

        (async () => {
            const assets = await Assets.load([texturePath, "/sandbox/lensMap.png"]);
            if (cancelled) return;

            const tex = assets[texturePath];
            // const dispTex = assets["/sandbox/lensMap.png"];

            setTexture(tex);

            // const displacementSprite = new Sprite(dispTex);
            // const displacementFilter = new DisplacementFilter({
            //     sprite: displacementSprite,
            //     scale: 150,
            // });

            // setLensFilter(new LensDistortionFilter(0.15));
        })();

        return () => {
            cancelled = true;
        };
    }, [texturePath]);

    const drawMask = useCallback(
        (g: PixiGraphics) => {
            if (!maskGraphics) setMaskGraphics(g);

            g.clear();
            g.circle(0, 0, radius);
            g.fill({color: 0xffffff});
        },
        [radius, maskGraphics]
    );

    const drawLens = useCallback(
        (g: PixiGraphics) => {
            g.clear();

            g.beginPath();
            g.circle(0, 0, radius * 1.05);

            const grad = new FillGradient({
                type: "radial",
                innerRadius: radius * 0.9,
                outerRadius: radius * 1.5,
                colorStops: [
                    {offset: 0.00, color: "#ffffff00"}, // центр полностью прозрачный
                    {offset: 0.55, color: "#66b7ff08"}, // едва заметный голубой
                    {offset: 0.80, color: "#66b7ff18"}, // мягкий переход
                    {offset: 1.00, color: "#66b7ff33"}, // край слегка светится
                ]
            });

            g.fill(grad);
        },
        [radius]
    );


    if (!texture) return null;

    return (
        <pixiContainer x={x} y={y}>
            <pixiGraphics draw={drawMask}/>
            {maskGraphics && (
                <pixiTilingSprite
                    ref={spriteRef}
                    texture={texture}
                    anchor={0.5}
                    width={radius * 2}
                    height={radius * 2}
                    mask={maskGraphics}
                    tileScale={{x: 0.44, y: 0.44}}
                />
            )}
            {shadowTexture && (
                <pixiSprite
                    blendMode="multiply"
                    texture={shadowTexture}
                    anchor={0.5}
                    x={0}
                    y={0}
                />
            )}

            {/*<pixiGraphics draw={drawShadow} rotation={Math.PI * 0.25}/>*/}

            <pixiGraphics
                draw={drawLens}
                filters={[blurFilter]}
            />
        </pixiContainer>
    );
}
