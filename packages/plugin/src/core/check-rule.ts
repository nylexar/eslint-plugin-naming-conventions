import { messageIds, type ErrorMessageId } from "@/constants/errors";

import type { EnforceAction, NamingRule } from "@/schema/types";
import type { FileContext } from "./get-file-context";
import type { RuleContext } from "@eslint/core";
import { makeErrorReporter } from "@/utils/format-error-messages";
import { matchesPattern } from "./matches-pattern";

function shouldSkip(action: EnforceAction | undefined): action is undefined {
  if (action === "error") {
    return false;
  }

  if (action === undefined) {
    return true;
  }

  return action.patterns.length === 0;
}

export function makeRuleChecker(
  ctx: RuleContext,
  node: unknown,
  fileCtx: FileContext,
) {
  const onViolation = makeErrorReporter(ctx, node, fileCtx);

  const coverage = { files: false, folder: false };

  return {
    check(
      type: "files" | "folder",
      rule: NamingRule,
      onErrorMessageId: ErrorMessageId = messageIds.PROHIBITED,
    ) {
      const enforce = rule.enforce[type];
      if (shouldSkip(enforce)) {
        return;
      }

      coverage[type] = true;

      if (enforce === "error") {
        onViolation(type, rule, messageIds[onErrorMessageId]);
        return;
      }

      const file = type === "files" ? fileCtx.file : fileCtx.dir;

      if (file.base === "" || matchesPattern(file, enforce)) {
        return;
      }

      onViolation(type, rule, messageIds.MISMATCH);
    },

    checkBoth(rule: NamingRule) {
      this.check("files", rule);
      this.check("folder", rule);
    },

    isCovered(type: "files" | "folder") {
      return coverage[type];
    },
  };
}
