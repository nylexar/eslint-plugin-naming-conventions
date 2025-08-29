import type { FileContext } from "./get-file-context";
import micromatch from "micromatch";
import { BUILT_IN_RUNTIME_ALIASES_REGEXP } from "@/constants/aliases";
import type { EnforceAction, NamingRule } from "@/schema/types";

function replaceAliases(
  pattern: string,
  aliases: Record<string, string>,
): string {
  return pattern.replace(
    new RegExp(BUILT_IN_RUNTIME_ALIASES_REGEXP.source, "g"),
    (match, key) => aliases[key] ?? match,
  );
}

function getRuntimeAliases(
  fileCtx: FileContext,
  rule: NamingRule,
): Record<string, string> | null {
  const filePattern = rule.match.patterns[0]?.compiled ?? "*";

  const groups =
    micromatch.capture(filePattern, fileCtx.file.path.relative) ?? [];

  const replacements: Record<string, string> = {
    file: fileCtx.file.name,
    dir: fileCtx.dir.name,
  };

  for (const [index, value] of groups.entries()) {
    replacements[index.toString()] = value;
  }

  return replacements;
}

function resolveAliases(
  config: EnforceAction | undefined,
  replacements: Record<string, string>,
) {
  if (!config || config === "error") {
    return config;
  }

  const patterns = config.patterns.map((pattern) => ({
    ...pattern,
    compiled: replaceAliases(pattern.compiled, replacements),
  }));

  return {
    ...config,
    patterns,
  };
}

export function resolveRuntimeAliases(
  fileCtx: FileContext,
  rule: NamingRule,
): NamingRule {
  const aliases = getRuntimeAliases(fileCtx, rule);

  if (!aliases) {
    return rule;
  }

  return {
    ...rule,
    enforce: {
      files: resolveAliases(rule.enforce.files, aliases),
      folder: resolveAliases(rule.enforce.folder, aliases),
    },
  };
}
