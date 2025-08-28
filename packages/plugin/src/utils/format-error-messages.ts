import type { ErrorMessageId } from "@/constants/errors";
import type { FileContext } from "@/core/get-file-context";
import type { EnforceAction, NamingRule } from "@/schema/types";
import type { RuleContext } from "@eslint/core";

export function formatRulePrefix(ruleId: string | undefined): string {
  return ruleId ? `[${ruleId}] ` : "";
}

export function formatRulePattern(action?: EnforceAction): string {
  if (action === undefined || action === "error") {
    return "";
  }

  const input = JSON.stringify(
    action.patterns.length === 1
      ? action.patterns[0]?.input
      : (action.patterns.map((c) => c.input) ?? []),
  );

  const compiled = JSON.stringify(
    action.patterns.length === 1
      ? action.patterns[0]?.compiled
      : (action.patterns.map((c) => c.compiled) ?? []),
  );

  return input !== compiled ? `${input}. Compiled Pattern: ${compiled}` : input;
}

export function makeErrorReporter(
  ctx: RuleContext,
  node: unknown,
  fileCtx: FileContext,
) {
  return (
    type: "files" | "folder",
    rule: NamingRule,
    messageId: ErrorMessageId,
  ) => {
    const fileCtxIdx = type === "files" ? "file" : "dir";

    ctx.report({
      node,
      messageId,
      data: {
        type,
        path: fileCtx[fileCtxIdx].path.relative,
        prefix: formatRulePrefix(rule.id),
        pattern: formatRulePattern(rule.enforce[type]),
      },
    });
  };
}
