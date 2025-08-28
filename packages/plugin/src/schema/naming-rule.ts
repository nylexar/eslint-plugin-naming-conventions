import { type } from "arktype";
import type { GlobPattern } from "@/schema/types";
import { makeMatcherResolver } from "./matcher";
import { makeGlobPatternResolver } from "./glob-pattern";
import { makeEnforceConfigResolver } from "./enforce";

const BaseConventionsType = type({
  "+": "reject",
  "id?": "string",
  match: "unknown",
  enforce: "unknown",
});

export function makeNamingRuleResolver({
  aliases,
  id: rootId,
}: {
  aliases: Record<string, GlobPattern>;
  id?: string;
}) {
  return BaseConventionsType.pipe((data) => {
    const ruleId = [rootId, data.id].filter(Boolean).join(" → ");

    const fileMatcher = makeMatcherResolver(
      makeGlobPatternResolver({
        context: "file-matcher",
        ruleId,
      }),
    );

    const enforceConfig = makeEnforceConfigResolver(aliases, ruleId);

    const refinedRule = BaseConventionsType.merge({
      match: fileMatcher,
      enforce: enforceConfig,
    }).pipe((data) => ({
      ...data,
      id: ruleId,
    }));

    return refinedRule(data);
  });
}
