export interface GlobPattern {
  input: string;
  compiled: string;
}

export type MatchType = "any" | "all";

export interface Matcher {
  type: MatchType;
  patterns: GlobPattern[];
}

export type EnforceAction = "error" | Matcher;

export interface EnforceConfig {
  files?: EnforceAction;
  folder?: EnforceAction;
}

export interface NamingRule {
  id: string;
  match: Matcher;
  enforce: EnforceConfig;
}

export type Chaining = "apply-and-stop" | "apply-and-continue";

export interface RuleOptions {
  id?: string;
  scope?: Matcher;
  chaining: Chaining;
  rules: NamingRule[];
}

export interface Settings {
  aliases: Record<string, GlobPattern>;
  onUnmatched: NamingRule;
}

export type GlobPatternContext =
  | "alias-definition"
  | "file-matcher"
  | "scope-matcher"
  | "enforce-matcher";

export interface GlobPatternOptions {
  context: GlobPatternContext;
  ruleId?: string;
  aliases?: Record<string, GlobPattern>;
}

export interface ValidationContext {
  ruleId?: string;
  aliases?: Record<string, GlobPattern>;
}
