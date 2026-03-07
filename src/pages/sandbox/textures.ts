import { Texture } from "pixi.js";

export function makeCircleTexture(color: number, radius: number): Texture {
    const canvas = document.createElement("canvas");
    canvas.width = radius * 2;
    canvas.height = radius * 2;

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#" + color.toString(16).padStart(6, "0");
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.fill();

    return Texture.from(canvas);
}
