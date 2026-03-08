import {useEffect, useRef} from "react";
import {Application} from "pixi.js";
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

                const manager = new EntityManager();

                const bot1 = new Bot()
                    .circle(0, 0, 20)
                    .fill(0x44ccff)
                    .setPosition(400, 300)
                    .bot(100, true)
                    .addBrain();

                bot1.id = 1;

                const bot2 = new Bot()
                    .circle(0, 0, 20)
                    .fill(0xff4444)
                    .setPosition(200, 150)
                    .bot(100, true)
                    .addBrain();

                bot2.id = 2;

                const cover = new Cover()
                    .circle(0, 0, 20)
                    .fill(0x888888)
                    .setPosition(600, 400);


                manager
                    .addBot(bot1)
                    .addBot(bot2)
                    .addCover(cover);

                appRef.current.stage.addChild(bot1, bot2, cover);

                for (let i = 0; i < 5; i++) {
                    const item = new Health()
                        .circle(0, 0, 20)
                        .fill(0x44ff44)
                        .setPosition(100 * i + 20, 200);

                    manager.addItem(item);
                    appRef.current.stage.addChild(item);
                }

                const tickerHandler = async () => {
                    await bot1.update();
                    await bot2.update();
                };

                appRef.current.ticker.add(tickerHandler);
            });

        return () => {
            if (!canvasRef.current || !appRef.current) return;
            appRef.current.destroy(true);
            appRef.current = null;
        };
    }, [appRef, canvasRef]);

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
