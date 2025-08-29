import micromatch from "micromatch";
import type { FileDetails, DirectoryDetails } from "./get-file-context";
import type { Matcher, MatchType } from "@/schema/types";

function combineResults(type: MatchType, ...result: boolean[]) {
  switch (type) {
    case "any": {
      return result.some((r) => r);
    }

    case "all": {
      return result.every((r) => r);
    }
  }
}

export function matchesPattern(
  file: FileDetails | DirectoryDetails,
  matcher: Matcher | undefined,
): boolean {
  if (!matcher) {
    return true;
  }

  const matchFn = micromatch[matcher.type];
  const compiledPatterns = matcher.patterns.map((p) => p.compiled);
  const pathPatterns = compiledPatterns.filter((p) => p.includes("/"));
  const namePatterns = compiledPatterns.filter((p) => !p.includes("/"));

  if (namePatterns.length === 0) {
    return matchFn(file.path.relative, pathPatterns);
  }

  const nameResult = combineResults(
    "any",
    matchFn(file.name, namePatterns),
    matchFn(file.base, namePatterns),
  );

  if (pathPatterns.length === 0) {
    return nameResult;
  }

  const pathResult = matchFn(file.path.relative, pathPatterns);

  return combineResults(matcher.type, nameResult, pathResult);
}
