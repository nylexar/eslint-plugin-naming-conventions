import { Traversal, type } from "arktype";
import type { EnforceAction, GlobPattern } from "@/schema/types";
import { makeMatcherResolver } from "./matcher";
import { makeGlobPatternResolver } from "./glob-pattern";

function validateEnforceConfig(
  config: { files?: EnforceAction; folder?: EnforceAction },
  ctx: Traversal,
): boolean {
  const hasFolder =
    config.folder === "error" || (config.folder?.patterns?.length ?? 0) > 0;

  const hasFiles =
    config.files === "error" || (config.files?.patterns?.length ?? 0) > 0;

  if (!hasFolder && !hasFiles) {
    return ctx.reject({
      message: `${ctx.propString} must include either "folder" or "files"`,
    });
  }

  return true;
}

export function makeEnforceConfigResolver(
  aliases: Record<string, GlobPattern>,
  ruleId?: string,
) {
  const enforceMatcher = makeMatcherResolver(
    makeGlobPatternResolver({
      context: "enforce-matcher",
      aliases,
      ruleId,
    }),
  );

  const enforceActionType = type("'error'| unknown").pipe((v) => {
    if (v === "error") {
      return v;
    }
    return enforceMatcher(v);
  });

  return type({
    "files?": enforceActionType,
    "folder?": enforceActionType,
  }).narrow(validateEnforceConfig);
}
