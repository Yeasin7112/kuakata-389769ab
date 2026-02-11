 import { defineConfig } from "vite";
 import react from "@vitejs/plugin-react-swc";
 import path from "path";
 import { componentTagger } from "lovable-tagger";
 import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
   plugins: [
     react(),
     mode === "development" && componentTagger(),
     VitePWA({
       registerType: "autoUpdate",
       includeAssets: ["favicon.ico", "robots.txt", "icons/*.png"],
       manifest: {
         name: "OurKuakata - Smart Tourist Guide",
         short_name: "OurKuakata",
         description: "Smart Tourist & Citizen Guide App for Kuakata, Patuakhali",
         theme_color: "#0ea5e9",
         background_color: "#0ea5e9",
         display: "standalone",
         orientation: "portrait",
         start_url: "/",
         scope: "/",
         lang: "bn",
         categories: ["travel", "navigation", "lifestyle"],
         icons: [
           {
             src: "/icons/icon-192.png",
             sizes: "192x192",
             type: "image/png",
             purpose: "any maskable"
           },
           {
             src: "/icons/icon-512.png",
             sizes: "512x512",
             type: "image/png",
             purpose: "any maskable"
           }
         ]
       },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}"],
         runtimeCaching: [
           {
             urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
             handler: "NetworkFirst",
             options: {
               cacheName: "supabase-cache",
               expiration: {
                 maxEntries: 100,
                 maxAgeSeconds: 60 * 60 * 24
               }
             }
           }
         ]
       }
     })
   ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
