import type { ESLint } from "eslint";
import { enforce } from "@/rules/enforce";

export const plugin: ESLint.Plugin = {
  meta: {
    name: "eslint-plugin-naming-conventions",
    version: __PLUGIN_VERSION__,
  },

  processors: {
    processor: {
      preprocess(_, filename) {
        return [
          {
            text: "",
            filename: filename,
          },
        ];
      },

      postprocess(messages) {
        return [...messages.flat()];
      },
    },
  },

  rules: {
    enforce,
  },
};
