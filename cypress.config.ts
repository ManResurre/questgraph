import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:5173", // порт по умолчанию для Vite
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
