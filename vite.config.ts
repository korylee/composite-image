import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === "lib")
    return {
      build: {
        outDir: "lib",
        lib: {
          entry: "./src/index.ts",
          name: "@korylee/composite-image",
          fileName: (format) => `index.${format}.js`,
        },
      },
    };
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@korylee/composite-image": resolve(__dirname, 'src/index.ts'),
      },
    },
    esbuild: {
      jsxFactory: "h",
      jsxFragment: "Fragment",
      jsxInject: `import { h } from 'vue'`,
    },
    base: "composite-image",
  };
});
