import type { Config } from "tailwindcss";
import tailwindScrollbar from "tailwind-scrollbar";
import tailwindAnimate from "tailwindcss-animate";

export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {},
    },
    plugins: [
        tailwindAnimate,
        tailwindScrollbar,
    ],
} satisfies Config;
