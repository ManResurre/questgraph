import { useEffect, useRef } from "react";
import { Application, Graphics } from "pixi.js";

export default function Sandbox() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const app = new Application({
            view: canvasRef.current,
            width: 800,
            height: 600,
            backgroundColor: 0x222222,
        });

        const g = new Graphics();
        g.beginFill(0xff0000);
        g.drawCircle(400, 300, 50);
        g.endFill();

        app.stage.addChild(g);
    }, []);

    return <canvas ref={canvasRef} />;
}
