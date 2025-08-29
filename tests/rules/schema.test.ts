import { BUILT_IN_STATIC_ALIASES } from "@/constants/aliases";
import { makeRuleOptionsResolver } from "@/schema/rule-options";
import { SettingsResolver } from "@/schema/settings";
import { type } from "arktype";

const pascal = BUILT_IN_STATIC_ALIASES["pascal-case"];
const camel = BUILT_IN_STATIC_ALIASES["camel-case"];

describe("EslintSettings", () => {
  function parseEslintSettings(input: unknown) {
    const result = SettingsResolver(input);

    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }

    return result;
  }

  const defaultSettings = {
    aliases: {},
    onUnmatched: {
      id: "onUnmatched",
      match: {
        type: "any",
        patterns: [{ input: "**/*", compiled: "**/*" }],
      },
      enforce: {
        files: "error",
        folder: {
          type: "any",
          patterns: [{ input: "<anything>", compiled: "*" }],
        },
      },
    },
  };

  it("parses empty settings", () => {
    expect(parseEslintSettings({})).toEqual(defaultSettings);

    expect(parseEslintSettings({ "naming-conventions": {} })).toEqual(
      defaultSettings,
    );
  });

  it("ignores unrelated settings", () => {
    const result = parseEslintSettings({
      other: { something: "else" },
    });

    expect(result).toEqual(defaultSettings);
  });

  describe("aliases", () => {
    const parseAliases = (input: unknown) => {
      return parseEslintSettings({ "naming-conventions": { aliases: input } })
        .aliases;
    };

    test("aliases may be provided", () => {
      const result = parseAliases({ ignore: "*" });

      expect(result).toEqual({
        ignore: { input: "*", compiled: "*" },
      });
    });

    test("aliases can be an empty object", () => {
      const result = parseAliases({});

      expect(result).toEqual({});
    });

    test("an alias may reference built-in variables", () => {
      const result = parseAliases({
        component: "<dir>Component.ts",
      });

      expect(result).toEqual({
        component: {
          input: "<dir>Component.ts",
          compiled: "<dir>Component.ts",
        },
      });
    });

    test("an alias may reference built-in casing styles", () => {
      const result = parseAliases({
        component: "**/<pascal-case>/<dir>Component.ts",
      });

      expect(result).toEqual({
        component: {
          input: "**/<pascal-case>/<dir>Component.ts",
          compiled: `**/${pascal}/<dir>Component.ts`,
        },
      });
    });

    test("an alias may not reference another alias", () => {
      expect(() =>
        parseAliases({
          ignore: "*",
          component: "<dir><ignore>.ts",
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [Error: The pattern "<dir><ignore>.ts" contains an unknown alias "<ignore>". User-defined aliases cannot reference other user-defined aliases.]
      `);
    });
  });
});

describe("EslintRuleOptions", () => {
  function parseEslintRule(input: unknown, aliases = {}) {
    const settings = SettingsResolver({ "naming-conventions": { aliases } });
    if (settings instanceof type.errors) {
      throw new Error(`Test setup failure: ${settings.summary}`);
    }

    const result = makeRuleOptionsResolver(settings)(input);

    if (result instanceof type.errors) {
      throw new Error(result.summary);
    }

    return result;
  }

  test("options cannot be undefined", () => {
    expect(() => parseEslintRule(undefined)).toThrowErrorMatchingInlineSnapshot(
      `[Error: must be an object (was undefined)]`,
    );
  });

  test("options cannot be null", () => {
    expect(() => parseEslintRule(null)).toThrowErrorMatchingInlineSnapshot(
      `[Error: must be an object (was null)]`,
    );
  });

  describe("rules", () => {
    test("rules cannot be empty", () => {
      expect(() => parseEslintRule({})).toThrowErrorMatchingInlineSnapshot(
        `[Error: rules must be present (was missing)]`,
      );
    });

    test("at least 1 rule must be provided", () => {
      expect(() =>
        parseEslintRule({ rules: [] }),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: rules must be non-empty]`);
    });

    test("rules can be an array with 1 rule", () => {
      const result = parseEslintRule({
        rules: [{ match: "*.ts", enforce: { files: "<camel-case>" } }],
      });

      expect(result.rules).toEqual([
        {
          id: "",
          match: {
            type: "any",
            patterns: [
              {
                input: "*.ts",
                compiled: "*.ts",
              },
            ],
          },

          enforce: {
            files: {
              type: "any",
              patterns: [
                {
                  input: "<camel-case>",
                  compiled: camel,
                },
              ],
            },
          },
        },
      ]);
    });

    test("rules can be an array with multiple rules", () => {
      const result = parseEslintRule({
        rules: [
          { match: "*.ts", enforce: { files: "<camel-case>" } },
          { match: "*.tsx", enforce: { files: "<pascal-case>" } },
        ],
      });

      expect(result.rules).toHaveLength(2);
    });

    test("rules can be an object (representing 1 rule)", () => {
      const result = parseEslintRule({
        rules: {
          match: "*.ts",
          enforce: { files: "<camel-case>" },
        },
      });

      expect(result.rules).toEqual([
        {
          id: "",
          match: {
            type: "any",
            patterns: [
              {
                input: "*.ts",
                compiled: "*.ts",
              },
            ],
          },
          enforce: {
            files: {
              type: "any",
              patterns: [
                {
                  input: "<camel-case>",
                  compiled: camel,
                },
              ],
            },
          },
        },
      ]);
    });
  });

  describe("rule matcher", () => {
    const parseMatcher = (match: unknown) => {
      return parseEslintRule({
        rules: [{ match, enforce: { files: "<camel-case>" } }],
      }).rules[0]?.match;
    };

    test("as a string", () => {
      const parsed = parseMatcher("*.ts");

      expect(parsed).toEqual({
        type: "any",
        patterns: [
          {
            input: "*.ts",
            compiled: "*.ts",
          },
        ],
      });
    });

    test("as an array of strings", () => {
      const parsed = parseMatcher(["*.ts", "*.tsx"]);

      expect(parsed).toEqual({
        type: "any",
        patterns: [
          {
            input: "*.ts",
            compiled: "*.ts",
          },
          {
            input: "*.tsx",
            compiled: "*.tsx",
          },
        ],
      });
    });

    test("as an object", () => {
      const parsed = parseMatcher({ type: "all", patterns: ["*.ts", "*.tsx"] });

      expect(parsed).toEqual({
        type: "all",
        patterns: [
          {
            input: "*.ts",
            compiled: "*.ts",
          },
          {
            input: "*.tsx",
            compiled: "*.tsx",
          },
        ],
      });
    });
  });

  describe("enforce", () => {
    const parseEnforce = (enforce: unknown, aliases = {}) => {
      return parseEslintRule(
        {
          rules: [{ match: "*.ts", enforce }],
        },
        aliases,
      ).rules[0]?.enforce;
    };

    describe.each(["files", "folder"])("%s", (attr) => {
      it("as a string", () => {
        const parsed = parseEnforce({ [attr]: "<camel-case>" });

        expect(parsed).toEqual({
          [attr]: {
            type: "any",
            patterns: [
              {
                input: "<camel-case>",
                compiled: camel,
              },
            ],
          },
        });
      });

      it("as an array of strings", () => {
        const parsed = parseEnforce({
          [attr]: ["<camel-case>", "**/*"],
        });

        expect(parsed).toEqual({
          [attr]: {
            type: "any",
            patterns: [
              {
                input: "<camel-case>",
                compiled: camel,
              },
              {
                input: "**/*",
                compiled: "**/*",
              },
            ],
          },
        });
      });

      it("as an object", () => {
        const parsed = parseEnforce({
          [attr]: { type: "all", patterns: ["<camel-case>", "**/*"] },
        });

        expect(parsed).toEqual({
          [attr]: {
            type: "all",
            patterns: [
              {
                input: "<camel-case>",
                compiled: camel,
              },
              {
                input: "**/*",
                compiled: "**/*",
              },
            ],
          },
        });
      });
    });

    test("must include either 'files' or 'folder'", () => {
      expect(() => parseEnforce({})).toThrowErrorMatchingInlineSnapshot(
        `[Error: enforce must include either "folder" or "files"]`,
      );
    });

    test("both files & folder", () => {
      const parsed = parseEnforce({
        files: ["<camel-case>"],
        folder: "<pascal-case>",
      });

      expect(parsed).toEqual({
        files: {
          type: "any",
          patterns: [
            {
              input: "<camel-case>",
              compiled: camel,
            },
          ],
        },
        folder: {
          type: "any",
          patterns: [
            {
              input: "<pascal-case>",
              compiled: pascal,
            },
          ],
        },
      });
    });

    test("custom aliases may be used in enforce patterns", () => {
      const parsed = parseEnforce(
        {
          files: ["<camel-case>"],
          folder: "<hexa>",
        },
        {
          hexa: "*[a-fA-F0-9]",
        },
      );

      expect(parsed).toEqual({
        files: {
          type: "any",
          patterns: [
            {
              input: "<camel-case>",
              compiled: camel,
            },
          ],
        },
        folder: {
          type: "any",
          patterns: [
            {
              input: "<hexa>",
              compiled: "*[a-fA-F0-9]",
            },
          ],
        },
      });
    });
  });
});
