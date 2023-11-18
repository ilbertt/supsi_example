import path from "path";
import { defineConfig } from "vite";
import EnvironmentPlugin from "vite-plugin-environment";
import dotenv from "dotenv";

dotenv.config();

const isDevelopment = process.env.NODE_ENV !== "production";

const frontendDirectory = "frontend";
const frontendEntry = path.join("src", frontendDirectory);

export default defineConfig({
  mode: isDevelopment ? "development" : "production",
  root: frontendEntry,
  build: {
    outDir: path.join(__dirname, "dist", frontendDirectory),
    emptyOutDir: true,
  },
  plugins: [
    EnvironmentPlugin("all", {
      prefix: "CANISTER_ID",
    }),
    EnvironmentPlugin("all", {
      prefix: "DFX",
    }),
    EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV,
    }),
  ],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:4943",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
    },
  },
});
