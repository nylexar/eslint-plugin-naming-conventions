import { type } from "arktype";
import type { Settings } from "@/schema/types";
import { makeMatcherResolver } from "./matcher";
import { makeGlobPatternResolver } from "./glob-pattern";
import { makeNamingRuleResolver } from "./naming-rule";

const BaseOptionsType = type({
  "+": "reject",
  "id?": "string | undefined",
  "scope?": "unknown",
  chaining: type("'apply-and-stop' | 'apply-and-continue'").default(
    "apply-and-stop",
  ),
  rules: "unknown",
});

export function makeRuleOptionsResolver(settings: Settings) {
  return BaseOptionsType.pipe(({ id, rules, ...rest }) => {
    const RulesType = makeNamingRuleResolver({
      id,
      aliases: settings.aliases,
    })
      .array()
      .atLeastLength(1);

    const refinedOptions = BaseOptionsType.merge({
      "scope?": makeMatcherResolver(
        makeGlobPatternResolver({
          context: "scope-matcher",
          ruleId: id,
        }),
      ),

      rules: RulesType,
    });

    return refinedOptions({
      id,
      ...rest,
      rules: Array.isArray(rules) ? rules : [rules],
    });
  });
}
