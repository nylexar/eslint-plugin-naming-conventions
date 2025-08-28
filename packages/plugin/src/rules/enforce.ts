import { errors, messageIds } from "@/constants/errors";
import { getFileContext } from "@/core/get-file-context";
import { matchesPattern } from "@/core/matches-pattern";
import { makeRuleChecker } from "@/core/check-rule";
import { resolveRuntimeAliases } from "@/core/resolve-runtime-aliases";
import { makeRuleOptionsResolver } from "@/schema/rule-options";
import { SettingsResolver } from "@/schema/settings";
import type { RuleDefinition } from "@eslint/core";
import { type } from "arktype";

export const enforce: RuleDefinition = {
  meta: {
    type: "layout",
    docs: {
      description: "Enforce consistent file naming conventions",
      recommended: true,
      url: "https://github.com/nylexar/eslint-plugin-naming-conventions",
    },
    // We implement custom validation
    schema: false,
    messages: errors,
  },

  create(ctx) {
    if (!ctx.options?.length) {
      throw new Error("Rule configuration is required and cannot be empty.");
    }

    const settings = SettingsResolver(JSON.parse(JSON.stringify(ctx.settings)));

    if (settings instanceof type.errors) {
      throw settings.toTraversalError();
    }

    const options = makeRuleOptionsResolver(settings).array()(
      JSON.parse(JSON.stringify(ctx.options)),
    );

    if (options instanceof type.errors) {
      throw options.toTraversalError();
    }

    return {
      Program: (node: unknown) => {
        const fileCtx = getFileContext(ctx);

        const applicableOptions = options.filter((option) =>
          matchesPattern(fileCtx.file, option.scope),
        );

        const checker = makeRuleChecker(ctx, node, fileCtx);

        for (const option of applicableOptions) {
          const applicableRules = option.rules
            .filter((rule) => matchesPattern(fileCtx.file, rule.match))
            .map((rule) => resolveRuntimeAliases(fileCtx, rule));

          for (const rule of applicableRules) {
            checker.checkBoth(rule);
          }

          if (option.chaining === "apply-and-stop") {
            break;
          }
        }

        if (!checker.isCovered("files")) {
          checker.check(
            "files",
            settings.onUnmatched,
            messageIds.NO_APPLICABLE_RULE,
          );
        }

        if (!checker.isCovered("folder")) {
          checker.check(
            "folder",
            settings.onUnmatched,
            messageIds.NO_APPLICABLE_RULE,
          );
        }
      },
    };
  },
};
