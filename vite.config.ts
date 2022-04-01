import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) =>
  mode === "lib"
    ? {
        build: {
          outDir: "lib",
          lib: {
            entry: "./src/index.ts",
            name: "@korylee/composite-image",
            fileName: (format) => `index.${format}.js`,
          },
        },
      }
    : {
        plugins: [vue()],
        esbuild: {
          jsxFactory: "h",
          jsxFragment: "Fragment",
          jsxInject: `import { h } from 'vue'`,
        },
      }
);
