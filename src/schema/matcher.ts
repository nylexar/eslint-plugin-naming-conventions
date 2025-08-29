import { Type, type, type Out } from "arktype";
import type { GlobPattern, MatchType } from "@/schema/types";

const MatchTypeType = type("'any' | 'all'");

function normalizeMatcherInput(v: unknown) {
  if (typeof v === "string") {
    return { type: "any" as const, patterns: [v] };
  }

  if (Array.isArray(v)) {
    return { type: "any" as const, patterns: v };
  }

  return v;
}

export function makeMatcherResolver(
  PatternType: Type<(In: string) => Out<GlobPattern>>,
) {
  return type("string | string[] | object").pipe.try(
    normalizeMatcherInput,
    type({
      "+": "reject",
      type: MatchTypeType.default("any"),
      patterns: PatternType.array().atLeastLength(1),
    }),
  );
}

export { MatchTypeType };
export type { MatchType };
