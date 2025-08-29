import { defineConfig } from "tsup";
import { peerDependencies, version } from "./package.json";

export default defineConfig((options) => {
  return {
    entry: ["src/**/*.ts"],
    format: ["esm"],
    target: "node21",
    bundle: true,
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    minify: !options.watch,
    external: [...Object.keys(peerDependencies)],
    tsconfig: "tsconfig.json",
    define: {
      __PLUGIN_VERSION__: JSON.stringify(version),
    },
  };
});
