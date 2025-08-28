import {
  casing,
  createTester,
  pattern,
  validateFileTree,
} from "./enforce-rule-tester";

afterEach(() => {
  vi.resetAllMocks();
  vi.resetModules();
});

describe("camel-case", () => {
  const t = casing("camel-case");

  t.expect({
    valid: [
      "login.tsx",
      "src/login.tsx",
      "src/components/login.tsx",
      "calculatePrice.ts",
      "src/calculatePrice.ts",
      "src/utils/calculatePrice.ts",
      "src/classes/g2tClass.ts",
      "calculatePrice.test.ts",
    ],

    invalid: [
      "src/utils/CalculatePrice.ts",
      "src/utils/calculate_price.ts",
      "src/utils/calculate-price.ts",
      "src/utils/CALCULATE_PRICE.ts",
      "src/classes/2gtClass.ts",
      "calculatePrice.endToEnd.ts",
      "calculatePrice.endToEnd.test.ts",
    ],
  });
});

describe("pascal-case", () => {
  const t = casing("pascal-case");

  t.expect({
    valid: [
      "src/components/Login.tsx",
      "src/utils/CalculatePrice.ts",
      "src/utils/Calculate2Price.ts",
      "CalculatePrice.test.ts",
    ],

    invalid: [
      "src/utils/calculatePrice.ts",
      "src/utils/calculate_price.ts",
      "src/utils/calculate-price.ts",
      "src/utils/CALCULATE_PRICE.ts",
      "src/utils/calculateprice.ts",
      "src/utils/2CalculatePrice.ts",
      "CalculatePrice.Test.ts",
      "CALCULATEPRICE.ts",
    ],
  });
});

describe("snake-case", () => {
  const t = casing("snake-case");

  t.expect({
    valid: [
      "src/components/login.tsx",
      "src/utils/calculate_price.ts",
      "src/utils/i18n_test.ts",
      "login.test.ts",
      "calculate_price.test.ts",
    ],

    invalid: [
      "src/utils/calculatePrice.ts",
      "src/utils/CalculatePrice.ts",
      "src/utils/calculate-price.ts",
      "src/utils/CALCULATE-PRICE.ts",
      "src/utils/CALCULATE_PRICE.ts",
      "src/utils/18n_test.ts",
      "calculate_price.end_to_end.ts",
    ],
  });
});

describe("kebab-case", () => {
  const t = casing("kebab-case");

  t.expect({
    valid: [
      "src/components/login.tsx",
      "src/utils/calculate-price.ts",
      "src/utils/i18n-test.ts",
      "calculate-price.test.ts",
    ],

    invalid: [
      "src/utils/calculatePrice.ts",
      "src/utils/CalculatePrice.ts",
      "src/utils/calculate_price.ts",
      "src/utils/CALCULATE_PRICE.ts",
      "src/utils/CALCULATE-PRICE.ts",
      "src/utils/18n-test.ts",
      "calculate-price.end-to-end.ts",
    ],
  });
});

describe("flat-case", () => {
  const t = casing("flat-case");

  t.expect({
    valid: [
      "src/components/login.tsx",
      "src/utils/calculateprice.ts",
      "src/utils/i18ntest.ts",
      "calculateprice.test.ts",
    ],

    invalid: [
      "src/utils/calculatePrice.ts",
      "src/utils/CalculatePrice.ts",
      "src/utils/calculate_price.ts",
      "src/utils/CALCULATE_PRICE.ts",
      "src/utils/CALCULATE-PRICE.ts",
      "src/utils/18n-test.ts",
      "calculateprice.end_to_end.ts",
    ],
  });
});

describe("different casing based on file extension", () => {
  const t = createTester({
    rules: [
      { match: "**/*.ts", enforce: { files: "<camel-case>" } },
      { match: "**/*.tsx", enforce: { files: "<pascal-case>" } },
    ],
  });

  t.expect({
    valid: [
      "src/utils/calculatePrice.ts",
      "src/utils/routes.ts",

      "src/components/Login.tsx",
      "src/components/AppHeader.tsx",
    ],

    invalid: [
      "src/utils/calculate_price.ts",
      "src/utils/calculate-price.ts",
      "src/utils/CalculatePrice.ts",

      "src/components/login.tsx",
      "src/components/app-header.tsx",
      "src/components/app_header.tsx",
      "src/components/appHeader.tsx",
    ],
  });
});

describe("__+([a-z])", () => {
  const t = pattern("__+([a-z])");

  t.expect({
    valid: ["src/components/__login.tsx", "src/utils/__calculateprice.ts"],

    invalid: [
      "src/utils/calculatePrice.ts",
      "src/utils/CalculatePrice.ts",
      "src/utils/calculate_price.ts",
      "src/utils/calculate-price.ts",
      "src/utils/CALCULATE_PRICE.ts",
      "src/utils/CALCULATE-PRICE.ts",
    ],
  });
});

describe("built-in aliases", () => {
  describe("dir", () => {
    const t = createTester({
      rules: [
        {
          match: "src/components/*/*.tsx",
          enforce: { files: "<dir>Component" },
        },
      ],
    });

    t.expect({
      valid: ["src/components/Button/ButtonComponent.tsx"],

      invalid: [
        "src/components/Button/Button.tsx",
        "src/components/Button/Component.tsx",
        "src/components/button/ButtonComponent.tsx",
      ],
    });
  });

  describe("positional aliases", () => {
    const t = createTester({
      rules: [
        {
          match: "src/components/*/*.{test,spec}.ts",
          enforce: { files: "<0>.<2>" },
        },
      ],
    });

    t.expect({
      valid: [
        "src/components/Button/Button.test.ts",
        "src/components/Button/Button.spec.ts",
      ],

      invalid: ["src/components/Button/index.test.ts"],
    });
  });
});

describe("matching multiple rules", () => {
  const t = createTester({
    rules: [
      {
        match: "src/components/*/*.tsx",
        enforce: { files: "<dir>Component" },
      },
      {
        match: "src/components/**/*.tsx",
        enforce: { files: "<pascal-case>" },
      },
    ],
  });

  t.expect({
    valid: [
      "src/components/LoginPage.tsx",
      "src/components/Button/ButtonComponent.tsx",
    ],

    invalid: [
      "src/components/login-page.tsx",
      "src/components/loginPage.tsx",
      "src/components/Button/Button.tsx",
      "src/components/button/buttonComponent.tsx",
    ],
  });

  t.expect({
    error: ["MISMATCH", "MISMATCH"],
    invalid: ["src/components/Button/index.tsx"],
  });
});

describe("directory rules", () => {
  const t = createTester({
    rules: [
      {
        match: "src/components/*/*",
        enforce: { folder: "<pascal-case>" },
      },
      {
        match: "**/*",
        enforce: { files: "<camel-case>" },
      },
    ],
  });

  t.expect({
    valid: [
      "src/components/login.tsx",
      "src/utils/calculatePrice.ts",
      "src/components/Button/index.tsx",
    ],

    invalid: ["src/components/button/index.jsx"],
  });
});

describe("scope", () => {
  const t = createTester({
    scope: "src/**/*",
    rules: [
      {
        match: "**/*",
        enforce: { files: "<camel-case>" },
      },
    ],
  });

  t.expect({
    valid: ["src/components/login.tsx", "src/utils/calculatePrice.ts"],
    invalid: ["src/components/button/Button.jsx"],
  });

  // Out-of-scope
  t.expect({
    invalid: ["test/Button.jsx"],
    error: "NO_APPLICABLE_RULE",
  });
});

describe("prohibited patterns", () => {
  const t = createTester([
    {
      chaining: "apply-and-continue",
      rules: {
        match: "*temp*",
        enforce: { files: "error" },
      },
    },
    {
      rules: {
        match: "**/*",
        enforce: { files: "<anything>" },
      },
    },
  ]);

  t.expect({
    valid: [
      "src/utils/calculatePrice.ts",
      "src/components/login.ts",
      "src/classes/UserClass.ts",
    ],

    invalid: [
      "tempFile.ts",
      "src/tempData.ts",
      "src/utils/temporaryFile.ts",
      "src/components/temp.ts",
    ],
    error: "PROHIBITED",
  });
});

describe("chaining behavior", () => {
  describe("chaining: apply-and-stop (default)", () => {
    const t = createTester([
      {
        chaining: "apply-and-stop",
        rules: {
          match: "**/*.ts",
          enforce: { files: "<camel-case>" },
        },
      },
      {
        rules: {
          match: "**/*.ts",
          enforce: { files: "<pascal-case>" },
        },
      },
    ]);

    t.expect({
      valid: ["src/utils/calculatePrice.ts", "src/components/userService.ts"],

      invalid: ["src/utils/CalculatePrice.ts", "src/components/UserService.ts"],
      error: "MISMATCH",
    });
  });

  describe("chaining: apply-and-continue", () => {
    const t = createTester([
      {
        chaining: "apply-and-continue",
        rules: {
          match: "**/*.ts",
          enforce: { files: "<camel-case>" },
        },
      },
      {
        rules: {
          match: "**/*.ts",
          enforce: { files: "<pascal-case>" },
        },
      },
    ]);

    t.expect({
      valid: [],

      invalid: ["src/utils/calculatePrice.ts", "src/utils/CalculatePrice.ts"],
      error: ["MISMATCH"],
    });
  });
});

describe("examples", () => {
  // https://github.com/dukeluo/eslint-plugin-check-file/tree/main/examples/basic
  describe("eslint-plugin-check-file - basic", () => {
    const options = [
      // no-index & filename-blocklist
      {
        chaining: "apply-and-continue",
        rules: [
          {
            match: "**/index.*",
            enforce: { files: "error" },
          },
          {
            match: "**/*.model.ts",
            enforce: { files: "error" },
          },
          {
            match: "**/*.util.ts",
            enforce: { files: "error" },
          },
        ],
      },

      // check-file/folder-match-with-fex
      {
        chaining: "apply-and-continue",
        rules: [
          {
            id: "tests must be placed in __tests__ folder",
            match: "*.test.{js,jsx,ts,tsx}",
            enforce: { folder: "**/__tests__" },
          },
          {
            id: "CSS modules must be placed in components folder",
            match: "*.module.{jsx,tsx}",
            enforce: { folder: "**/components" },
          },
        ],
      },

      // check-file/folder-naming-convention
      // check-file/filename-naming-convention
      {
        rules: [
          {
            match: "**/*.{jsx,tsx}",
            enforce: { files: ["<pascal-case>", "<pascal-case>.test"] },
          },
          {
            match: "**/*.{js,ts}",
            enforce: {
              files: ["<camel-case>", "<camel-case>.{config,models,test}"],
            },
          },
          {
            match: "**/*.css",
            enforce: { files: ["<pascal-case>.module"] },
          },
          {
            match: "**/*.md",
            enforce: { files: "<flat-case>" },
          },
          {
            match: "**/*.webp",
            enforce: { files: "<kebab-case>" },
          },
          {
            match: "src/components/*/*",
            enforce: { folder: "<pascal-case>" },
          },
          {
            match: {
              type: "all",
              patterns: ["!src/components/**", "!src/**/__tests__/**"],
            },
            enforce: { folder: "<camel-case>" },
          },
        ],
      },
    ];

    const fileTree = [
      "src/components/Button/__tests__/Button.test.tsx",
      "src/components/Button/Button.module.css",
      "src/components/Button/Button.tsx",
      "src/ko-fi.webp",
      "src/main.js",
      "src/main.md",
      "src/models/user.models.ts",
      "src/utils/__tests__/formatDate.test.ts",
      "src/utils/formatDate.ts",
    ];

    validateFileTree(options, fileTree, {
      onUnmatched: { files: "error", folder: "error" },
    });
  });
});
