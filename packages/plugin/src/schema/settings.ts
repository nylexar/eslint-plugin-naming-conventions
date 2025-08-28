import { type } from "arktype";
import { makeGlobPatternResolver } from "./glob-pattern";
import { makeEnforceConfigResolver } from "./enforce";
import type { EnforceConfig, NamingRule } from "./types";

const BaseSettingsType = type({
  "+": "reject",

  aliases: type({
    "+": "reject",
    "[string]": makeGlobPatternResolver({ context: "alias-definition" }),
  }).default(() => ({})),

  onUnmatched: type({
    "files?": "unknown",
    "folder?": "unknown",
  }).default(() => ({
    files: "error",
    folder: "<anything>",
  })),
});

export const SettingsResolver = type({
  "+": "delete",
  "naming-conventions": BaseSettingsType.default(() => ({})),
}).pipe((settings) => {
  const data = settings["naming-conventions"];

  const refinedSettings = BaseSettingsType.merge({
    aliases: type({
      "+": "reject",
      "[string]": {
        input: "string > 0",
        compiled: "string > 0",
      },
    }),

    onUnmatched: makeEnforceConfigResolver(data.aliases, "onUnmatched").pipe(
      (enforce: EnforceConfig): NamingRule => {
        return {
          id: "onUnmatched",
          match: {
            type: "any",
            patterns: [{ input: "**/*", compiled: "**/*" }],
          },
          enforce,
        };
      },
    ),
  });

  return refinedSettings(data);
});
