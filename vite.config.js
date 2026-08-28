import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [vue()],
    server: {
      host: "0.0.0.0", // Change this to a valid IP address if needed
      port: 5173, // Optional otherwise your app will start on default port
      allowedHosts: true,
      proxy: {
        "/bgg-api": {
          target: "https://boardgamegeek.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/bgg-api/, "/xmlapi2"),
          headers: env.BGG_API_TOKEN
            ? { Authorization: `Bearer ${env.BGG_API_TOKEN}` }
            : {},
        },
        "/noco-api": {
          target: "https://ndb.3xbun.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/noco-api/, ""),
          headers: env.NOCODB_API_TOKEN
            ? { "xc-token": env.NOCODB_API_TOKEN }
            : {},
        },
        "/n8n-api": {
          target: "https://n8n.3xbun.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/n8n-api/, ""),
        },
      },
    },
  };
});
