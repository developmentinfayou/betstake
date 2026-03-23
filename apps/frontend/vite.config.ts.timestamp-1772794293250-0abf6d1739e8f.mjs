// vite.config.ts
import { defineConfig } from "file:///C:/Users/mukul/betstake-1/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/mukul/betstake-1/node_modules/@vitejs/plugin-react/dist/index.js";
import { nodePolyfills } from "file:///C:/Users/mukul/betstake-1/node_modules/vite-plugin-node-polyfills/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\mukul\\betstake-1\\apps\\frontend";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["buffer", "crypto", "stream", "process"],
      globals: { Buffer: true, process: true }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@casino/shared": path.resolve(__vite_injected_original_dirname, "../../packages/shared"),
      "@casino/fairness": path.resolve(__vite_injected_original_dirname, "../../packages/fairness")
    }
  },
  server: {
    port: 3e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtdWt1bFxcXFxiZXRzdGFrZS0xXFxcXGFwcHNcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG11a3VsXFxcXGJldHN0YWtlLTFcXFxcYXBwc1xcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbXVrdWwvYmV0c3Rha2UtMS9hcHBzL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscyc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgICByZWFjdCgpLFxyXG4gICAgICAgIG5vZGVQb2x5ZmlsbHMoe1xyXG4gICAgICAgICAgICBpbmNsdWRlOiBbJ2J1ZmZlcicsICdjcnlwdG8nLCAnc3RyZWFtJywgJ3Byb2Nlc3MnXSxcclxuICAgICAgICAgICAgZ2xvYmFsczogeyBCdWZmZXI6IHRydWUsIHByb2Nlc3M6IHRydWUgfSxcclxuICAgICAgICB9KSxcclxuICAgIF0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgYWxpYXM6IHtcclxuICAgICAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcclxuICAgICAgICAgICAgJ0BjYXNpbm8vc2hhcmVkJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZCcpLFxyXG4gICAgICAgICAgICAnQGNhc2luby9mYWlybmVzcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9mYWlybmVzcycpLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgICAgcG9ydDogMzAwMCxcclxuICAgIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1ULFNBQVMsb0JBQW9CO0FBQ2hWLE9BQU8sV0FBVztBQUNsQixTQUFTLHFCQUFxQjtBQUM5QixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsU0FBUztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLE1BQ1YsU0FBUyxDQUFDLFVBQVUsVUFBVSxVQUFVLFNBQVM7QUFBQSxNQUNqRCxTQUFTLEVBQUUsUUFBUSxNQUFNLFNBQVMsS0FBSztBQUFBLElBQzNDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDcEMsa0JBQWtCLEtBQUssUUFBUSxrQ0FBVyx1QkFBdUI7QUFBQSxNQUNqRSxvQkFBb0IsS0FBSyxRQUFRLGtDQUFXLHlCQUF5QjtBQUFBLElBQ3pFO0FBQUEsRUFDSjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBLEVBQ1Y7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
