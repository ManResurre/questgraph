import type {Config} from "tailwindcss";
import tailwindScrollbar from "tailwind-scrollbar";
import tailwindAnimate from "tailwindcss-animate";

export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                dialogue: ['"Alegreya"'],
                fontSize: {dialogue: "22px"},
            },
        }
    },
    plugins: [
        tailwindAnimate,
        tailwindScrollbar,
    ],
} satisfies Config;
