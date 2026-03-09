import {useEffect, useRef} from "react";
import {Application, HTMLText} from "pixi.js";
import {Box} from "@mui/material";
import {Bot} from "./Bot";
import {Health} from "./Health";
import {Cover} from "./Cover";
import {EntityManager} from "./EntityManager";

export default function Sandbox() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<Application | null>(new Application());
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!canvasRef.current || !appRef.current) return;

        appRef.current
            .init({
                canvas: canvasRef.current,
                background: "#222",
                antialias: true,
                width: 800,
                height: 600,
            })
            .then(() => {
                if (!canvasRef.current || !appRef.current) return;
                if (initializedRef.current) return;
                initializedRef.current = true;

                const app = appRef.current;

                const fpsText = new HTMLText({
                    text: "FPS: 0",
                    style: {
                        fontSize: 14,
                        fill: "#00ff00",
                        fontWeight: "bold",
                    },
                });
                fpsText.position.set(10, 10);
                app.stage.addChild(fpsText);

                const manager = new EntityManager();
                manager.setApp(app);
                manager.setBotCount(5);

                const cover = new Cover()
                    .circle(0, 0, 20)
                    .fill(0x888888)
                    .setPosition(600, 400);

                app.stage.addChild(cover);

                for (let i = 0; i < 5; i++) {
                    const item = new Health()
                        .circle(0, 0, 20)
                        .fill(0x44ff44)
                        .setPosition(100 * i + 20, 200);

                    manager.addItem(item);
                    app.stage.addChild(item);
                }

                const tickerHandler = () => {
                    const delta = app.ticker.deltaMS / 16.666;

                    fpsText.text = "FPS: " + Math.round(app.ticker.FPS);

                    manager.update(delta)
                };

                app.ticker.add(tickerHandler);
            });

        return () => {
            if (!canvasRef.current || !appRef.current) return;
            appRef.current.destroy(true);
            appRef.current = null;
        };
    }, []);

    return (
        <Box
            height="100%"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        >
            <canvas ref={canvasRef}/>
        </Box>
    );
}
