import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync } from "fs";
import { resolve } from "path";

// Plugin to copy web.config to dist after build
const copyWebConfig = () => ({
  name: "copy-web-config",
  closeBundle() {
    try {
      const src = resolve(__dirname, "public/web.config");
      const dest = resolve(__dirname, "dist/web.config");
      if (existsSync(src)) {
        copyFileSync(src, dest);
        console.log("✅ web.config copied to dist");
      }
    } catch (error) {
      console.error("❌ Error copying web.config:", error);
    }
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyWebConfig()],
  base: "/", // Đảm bảo base URL đúng cho production
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:5070",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          charts: ["recharts"],
          ui: ["lucide-react"],
        },
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
  preview: {
    port: 4173,
    host: true,
  },
});
