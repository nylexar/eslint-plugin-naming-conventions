import {
  ALIAS_SYNTAX_REGEXP,
  BUILT_IN_RUNTIME_ALIASES_REGEXP,
  BUILT_IN_STATIC_ALIASES,
} from "@/constants/aliases";
import { Traversal, type } from "arktype";
import isGlob from "is-glob";
import type { GlobPattern, GlobPatternOptions } from "@/schema/types";
import { formatRulePrefix } from "@/utils/format-error-messages";

function formatMessage(
  message: string,
  opts: {
    ruleId: string | undefined;
    input: string;
    compiled: string;
  },
): string {
  const { ruleId, input, compiled } = opts;

  const prefix = `${formatRulePrefix(ruleId)}The pattern ${JSON.stringify(input)} `;

  const suffix = `${compiled === input ? "" : ` (Raw Pattern: "${compiled}")`}`;

  return `${prefix}${message}${suffix}`;
}

function compileAliases(
  pattern: string,
  { aliases, context }: GlobPatternOptions,
): string {
  let compiled = pattern;

  for (const [key, value] of Object.entries(aliases ?? {})) {
    compiled = compiled.replaceAll(new RegExp(`<${key}>`, "g"), value.compiled);
  }

  if (["alias-definition", "enforce-matcher"].includes(context)) {
    for (const [key, value] of Object.entries(BUILT_IN_STATIC_ALIASES)) {
      compiled = compiled.replaceAll(new RegExp(`<${key}>`, "g"), value);
    }
  }

  return compiled;
}

function validateGlobPattern(
  input: string,
  compiled: string,
  ruleId: string | undefined,
  ctx: Traversal,
): boolean {
  const clean = compiled.replaceAll(
    new RegExp(BUILT_IN_RUNTIME_ALIASES_REGEXP.source, "g"),
    "*",
  );

  const unknownAlias = clean.match(ALIAS_SYNTAX_REGEXP);
  if (unknownAlias) {
    return ctx.reject({
      message: formatMessage(
        `contains an unknown alias "${unknownAlias[0]}". User-defined aliases cannot reference other user-defined aliases.`,
        { ruleId, input, compiled },
      ),
    });
  }

  if (!isGlob(clean)) {
    return ctx.reject({
      message: formatMessage(
        `contains an invalid glob pattern. See https://github.com/micromatch/micromatch for syntax details.`,
        { ruleId, input, compiled },
      ),
    });
  }

  return true;
}

export function makeGlobPatternResolver(options: GlobPatternOptions) {
  return type("string > 0")
    .pipe(
      (input: string): GlobPattern => ({
        input,
        compiled: compileAliases(input, options),
      }),
    )
    .narrow(({ input, compiled }, ctx) => {
      return validateGlobPattern(input, compiled, options.ruleId, ctx);
    });
}
