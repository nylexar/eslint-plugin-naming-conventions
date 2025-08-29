import { RuleTester } from "eslint";
import { enforce } from "@/rules/enforce";

type BaseTestError = string | { messageId: string } | { message: string };

type TestError = BaseTestError | BaseTestError[];

type Config = unknown;

class EnforceRuleTester {
  private readonly ruleTester: RuleTester;

  constructor(
    private readonly _options?: Config,
    private readonly _settings?: Config,
  ) {
    this.ruleTester = new RuleTester();
  }

  expect({
    valid,
    invalid,
    error,
  }: {
    valid?: string | string[];
    invalid?: string | string[];
    error?: TestError;
  }) {
    describe("posix", () => {
      beforeEach(async () => {
        vi.resetModules();
        vi.mock("node:path", async () => {
          const path = await vi
            .importActual<typeof import("node:path")>("node:path")
            .then((mod) => mod.posix);

          return {
            default: path,
            ...path,
          };
        });
      });

      const validCases = valid ? this._createValidCases(valid, "/") : [];

      const invalidCases = invalid
        ? this._createInvalidCases(invalid, "/", error)
        : [];

      this.runTest({ valid: validCases, invalid: invalidCases });
    });

    describe("win32", () => {
      beforeEach(async () => {
        vi.resetModules();
        vi.mock("node:path", async () => {
          const path = await vi
            .importActual<typeof import("node:path")>("node:path")
            .then((mod) => mod.win32);

          return {
            default: path,
            ...path,
          };
        });
      });

      const validCases = valid ? this._createValidCases(valid, "\\") : [];

      const invalidCases = invalid
        ? this._createInvalidCases(invalid, "\\", error)
        : [];

      this.runTest({ valid: validCases, invalid: invalidCases });
    });
  }

  private _makeErrors(error?: TestError): RuleTester.TestCaseError[] {
    if (Array.isArray(error)) {
      return error.map((err) => this._makeErrors(err)).flat();
    }

    if (!error) {
      return [{ line: 1, column: 1 }];
    }
    if (typeof error === "string") {
      return [{ messageId: error, line: 1, column: 1 }];
    }

    if ("messageId" in error) {
      return [{ messageId: error.messageId, line: 1, column: 1 }];
    }

    if ("message" in error) {
      return [{ message: error.message, line: 1, column: 1 }];
    }

    return error;
  }

  private _createValidCases(
    files: string | string[],
    sep: string,
    overrides?: Partial<RuleTester.ValidTestCase>,
  ): RuleTester.ValidTestCase[] {
    const filenames = Array.isArray(files) ? files : [files];

    return filenames.map((filename) => ({
      code: "",
      name: filename.replaceAll("/", sep),
      filename: filename.replaceAll("/", sep),
      ...(this._options ? { options: [this._options].flat() } : {}),
      ...(this._settings
        ? { settings: { "naming-conventions": this._settings } }
        : {}),
      ...overrides,
    }));
  }

  private _createInvalidCases(
    files: string | string[],
    sep: string,
    error?: TestError,
    overrides?: Partial<RuleTester.InvalidTestCase>,
  ): RuleTester.InvalidTestCase[] {
    const filenames = Array.isArray(files) ? files : [files];

    return filenames.map((filename) => ({
      code: "",
      name: `${filename}`.replaceAll("/", sep),
      filename: filename.replaceAll("/", sep),
      errors: this._makeErrors(error ?? "MISMATCH"),
      ...(this._options ? { options: [this._options].flat() } : {}),
      ...(this._settings
        ? { settings: { "naming-conventions": this._settings } }
        : {}),
      ...overrides,
    }));
  }

  private runTest(tests: {
    valid: RuleTester.ValidTestCase[];
    invalid: RuleTester.InvalidTestCase[];
  }) {
    this.ruleTester.run("naming-conventions/enforce", enforce, tests);
  }
}

export function createTester(options?: Config, settings?: Config) {
  return new EnforceRuleTester(options, settings);
}

export function pattern(files: string, match: string = "**/*.{ts,tsx}") {
  return new EnforceRuleTester({ rules: [{ match, enforce: { files } }] });
}

export function casing(style: string, match = ["**/*.{ts,tsx}"]) {
  return new EnforceRuleTester({
    rules: {
      id: style,
      match,
      enforce: { files: [`<${style}>`, `<${style}>.<flat-case>`] },
    },
  });
}

export function validateFileTree(
  rules: Config,
  fileTree: string[],
  settings?: Config,
) {
  const tester = createTester(rules, settings);
  return tester.expect({
    valid: fileTree,
  });
}
