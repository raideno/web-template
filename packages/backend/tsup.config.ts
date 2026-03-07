import { defineConfig } from "tsup";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  outDir: "dist",
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  tsconfig: "tsconfig.build.json",
  esbuildOptions(options) {
    options.alias = {
      "@/convex": resolve(__dirname, "src/_generated"),
      "@": resolve(__dirname, "src"),
    };
  },
});
