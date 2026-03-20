import {extend, useTick} from "@pixi/react";
import {
    Assets,
    Texture,
    TilingSprite as PixiTilingSprite,
    Graphics as PixiGraphics,
    Container as PixiContainer, UPDATE_PRIORITY, TilingSprite, FillGradient,
 Filter, GlProgram } from "pixi.js";
import {useEffect, useState, useCallback, useRef} from "react";


export class LensDistortionFilter extends Filter {
    constructor(strength = 0.2) {

        const vertex = `
            precision mediump float;

            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;

            uniform mat3 uProjectionMatrix;

            varying vec2 vTextureCoord;

            void main() {
                vTextureCoord = aTextureCoord;
                gl_Position = vec4((uProjectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
            }
        `;

        const fragment = `
            precision mediump float;

            varying vec2 vTextureCoord;
            uniform sampler2D uTexture;
            uniform float strength;

            void main() {
                vec2 uv = vTextureCoord * 2.0 - 1.0;
                float dist = dot(uv, uv);

                vec2 distorted = uv * (1.0 + strength * dist);
                vec2 finalUV = (distorted + 1.0) * 0.5;

                gl_FragColor = texture2D(uTexture, finalUV);
            }
        `;

        const glProgram = new GlProgram({ vertex, fragment });

        super({
            glProgram,
            resources: {
                strengthUniforms: {
                    strength: { value: strength, type: "f32" }
                }
            }
        });
    }
}



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

export function Planet(
    {
        texturePath,
        radius = 80,
        x = 0,
        y = 0,
        rotationSpeed = 0.1,
    }: PlanetProps) {

    const [texture, setTexture] = useState<Texture | null>(null);
    const [lensFilter, setLensFilter] = useState<LensDistortionFilter>(null);

    const [maskGraphics, setMaskGraphics] = useState<PixiGraphics | null>(null);
    const spriteRef = useRef<TilingSprite>(null)

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

            setLensFilter(new LensDistortionFilter(0.15));
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
            {maskGraphics && (
                <pixiTilingSprite
                    ref={spriteRef}
                    texture={texture}
                    anchor={0.5}
                    width={radius * 2}
                    height={radius * 2}
                    mask={maskGraphics}
                    tileScale={{x: 0.44, y: 0.44}}
                    // filters={lensFilter ? [lensFilter] : undefined}
                />
            )}

            {/* маска */}
            <pixiGraphics draw={drawMask}/>
            <pixiGraphics draw={drawLens}/>
        </pixiContainer>
    );
}
