import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
    plugins: [
        react({
            jsxImportSource: "@emotion/react",
            babel: {
                plugins: ["@emotion/babel-plugin"]
            }
        }),
        tailwindcss()
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src")
        }
    }
});
