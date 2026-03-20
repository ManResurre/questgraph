import {Application, extend} from "@pixi/react";
import {Graphics, Sprite, Container, TilingSprite} from "pixi.js";
import {useState, useRef, useEffect} from "react";
import {CANVAS_WIDTH, CANVAS_HEIGHT} from "@/pages/sandbox/config";

import {StarsectorBackground} from "./StarsectorBackground";
import {Planet} from "@/pages/sandbox/scene2/Planet.tsx";

extend({Graphics, Sprite, Container, TilingSprite});

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

    return (
        <Application
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            backgroundColor={0x000000}
            antialias
        >
            <StarsectorBackground/>
            <Planet
                texturePath="/sandbox/earth.jpg"
                radius={80}
                x={CANVAS_WIDTH / 2}
                y={CANVAS_HEIGHT / 2}
                rotationSpeed={0.05}
            />
        </Application>
    );
}
