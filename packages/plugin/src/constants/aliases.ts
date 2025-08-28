import { ASTRO_ROUTE } from "./astro";
import { NEXT_JS_APP_ROUTER_FOLDER, NEXT_JS_PAGE_ROUTER_FILE } from "./nextjs";

/**
 * Matches built-in runtime aliases like `<1>`, `<dir>`, or `<file>`.
 * These are resolved at runtime, not during initial validation as they
 * depend on the file path.
 */
export const BUILT_IN_RUNTIME_ALIASES_REGEXP = /<(\d+|dir|file)>/;

/**
 * A generic syntax to capture any alias pattern like `<name>`.
 */
export const ALIAS_SYNTAX_REGEXP = /<(.*?)>/;

const BASE_ALIASES = {
  anything: "*",

  // hello, helloWorld
  "camel-case": "+([a-z])*([a-z0-9])*([A-Z]*([a-z0-9]))",

  // Hello, HelloWorld
  "pascal-case": "[A-Z]+([a-z0-9])*([A-Z]+([a-z0-9]))",

  // hello, hello_world
  "snake-case": "+([a-z])*([a-z0-9])*(_+([a-z0-9]))",

  // hello, hello-world
  "kebab-case": "+([a-z])*([a-z0-9])*(-+([a-z0-9]))",

  // hello, helloworld
  "flat-case": "+([a-z0-9])",
};

function compileDerivedAlias(pattern: string): string {
  let compiled = pattern;

  for (const [key, value] of Object.entries(BASE_ALIASES)) {
    compiled = compiled.replaceAll(new RegExp(`<${key}>`, "g"), value);
  }

  return compiled;
}

const DERIVATIVE_ALIASES = {
  // app, [helpPageId], [...auth], [[...auth]], (auth), \@feed
  "nextjs-app-router-folder": compileDerivedAlias(NEXT_JS_APP_ROUTER_FOLDER),

  // _app, _document, index, [helpPageId], [...auth], [[...auth]]
  "nextjs-page-router-file": compileDerivedAlias(NEXT_JS_PAGE_ROUTER_FILE),

  /**
   * app, about-us, [postSlug], check-[userName]-profile, [...auth]
   */
  "astro-route": compileDerivedAlias(ASTRO_ROUTE),
};

export const BUILT_IN_STATIC_ALIASES = {
  ...BASE_ALIASES,
  ...DERIVATIVE_ALIASES,
};

export type BuiltInStaticAlias = keyof typeof BUILT_IN_STATIC_ALIASES;
