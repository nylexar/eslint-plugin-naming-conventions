import { createTester } from "./enforce-rule-tester";

afterEach(() => {
  vi.resetAllMocks();
  vi.resetModules();
});

describe("Quick Start", () => {
  const t = createTester({
    rules: {
      match: "**/*.{js,ts}",
      enforce: { files: "<camel-case>" },
    },
  });

  t.expect({
    valid: ["userService.js", "dataProcessor.ts", "authHelper.js"],
    invalid: ["UserService.ts", "data-processor.js", "auth_helper.ts"],
  });
});

describe("Multiple Rules", () => {
  const t = createTester({
    rules: [
      {
        match: "**/*.{js,ts}",
        enforce: { files: "<camel-case>" },
      },
      {
        match: "**/*.{jsx,tsx}",
        enforce: { files: "<pascal-case>" },
      },
    ],
  });

  t.expect({
    valid: [
      "userProfile.js",
      "shoppingCart.ts",
      "UserProfile.jsx",
      "ShoppingCart.tsx",
    ],
    invalid: [
      "UserProfile.js",
      "user-profile.ts",
      "userProfile.jsx",
      "shopping-cart.tsx",
    ],
  });
});

describe("Folder Naming", () => {
  const t = createTester(
    {
      rules: [
        {
          match: "src/components/*/*",
          enforce: { folder: "<pascal-case>" },
        },
        {
          match: "src/routes/*/*",
          enforce: { folder: "<kebab-case>" },
        },
      ],
    },
    {
      onUnmatched: { files: "<anything>" },
    },
  );

  t.expect({
    valid: [
      "src/components/Button/Button.tsx",
      "src/components/UserProfile/index.tsx",
      "src/routes/user-profile/page.tsx",
      "src/routes/shopping-cart/layout.tsx",
    ],
    invalid: [
      "src/components/button/Button.tsx",
      "src/components/user-profile/index.tsx",
      "src/routes/UserProfile/page.tsx",
      "src/routes/ShoppingCart/layout.tsx",
    ],
  });
});

describe("Built-in Naming Patterns", () => {
  const t = createTester({
    rules: [
      {
        match: "src/hooks/**",
        enforce: { files: "use<pascal-case>" },
      },
    ],
  });

  t.expect({
    valid: [
      "src/hooks/useAuth.js",
      "src/hooks/useUserData.ts",
      "src/hooks/useShoppingCart.js",
    ],
    invalid: [
      "src/hooks/Auth.js",
      "src/hooks/useauth.js",
      "src/hooks/use-auth.js",
    ],
  });
});

describe("Runtime Aliases", () => {
  const t = createTester({
    rules: [
      {
        match: "src/components/*/*.tsx",
        enforce: { files: "<dir>" },
      },
      {
        match: "src/components/*/*.css",
        enforce: { files: "<dir>.module" },
      },
    ],
  });

  t.expect({
    valid: [
      "src/components/Button/Button.tsx",
      "src/components/Header/Header.tsx",
      "src/components/Button/Button.module.css",
    ],
    invalid: [
      "src/components/Button/index.tsx",
      "src/components/Header/header.tsx",
      "src/components/Button/styles.module.css",
    ],
  });
});

describe("Custom Aliases", () => {
  const t = createTester(
    {
      rules: [
        {
          match: "src/components/**/*.tsx",
          enforce: { files: "<component>" },
        },
      ],
    },
    {
      aliases: {
        component: "<pascal-case>{Component,Container,Provider}",
      },
    },
  );

  t.expect({
    valid: [
      "src/components/UserComponent.tsx",
      "src/components/AuthContainer.tsx",
      "src/components/ThemeProvider.tsx",
    ],
    invalid: [
      "src/components/UserManager.tsx",
      "src/components/useAuthComponent.tsx",
    ],
  });
});

describe("Pattern Matching with Micromatch", () => {
  const t = createTester({
    rules: [
      {
        match: "**/!(*.test).ts",
        enforce: { files: "<kebab-case>" },
      },
      {
        match: "src/components/**/*.tsx",
        enforce: { files: "<pascal-case>?(.test|.stories)" },
      },
      {
        match: "api/v[0-9]/**/*.ts",
        enforce: { files: "<kebab-case>" },
      },
    ],
  });

  t.expect({
    valid: [
      "user-service.ts",
      "src/components/Button.tsx",
      "src/components/Button.test.tsx",
      "src/components/Header.stories.tsx",
      "api/v1/user-profile.ts",
      "api/v2/shopping-cart.ts",
    ],
    invalid: [
      "userService.ts",
      "src/components/button.tsx",
      "src/components/Button.spec.tsx",
    ],
  });

  t.expect({
    error: ["MISMATCH", "MISMATCH"],
    invalid: ["api/v1/userProfile.ts"],
  });

  t.expect({
    error: "NO_APPLICABLE_RULE",
    invalid: ["userService.test.ts"],
  });
});

describe("Boolean Logic in Matchers", () => {
  const t = createTester({
    rules: [
      {
        match: {
          type: "all",
          patterns: [
            "**/*.ts",
            "!**/__tests__/**",
            "!**/__mocks__/**",
            "!**/*.test.ts",
            "!**/*.spec.ts",
            "!**/*.mock.ts",
          ],
        },
        enforce: { files: "<camel-case>" },
      },
      {
        match: {
          type: "any",
          patterns: ["src/components/**/*.tsx", "src/containers/**/*.tsx"],
        },
        enforce: { files: "<pascal-case>" },
      },
    ],
  });

  t.expect({
    valid: [
      "src/services/userService.ts",
      "src/api/dataProcessor.ts",
      "src/components/Button.tsx",
      "src/containers/UserDashboard.tsx",
    ],
    invalid: ["src/services/UserService.ts", "src/components/button.tsx"],
  });

  t.expect({
    error: "NO_APPLICABLE_RULE",
    invalid: ["src/__tests__/UserService.ts", "userService.test.ts"],
  });
});

describe("Boolean Logic in Enforce Patterns", () => {
  const t = createTester({
    rules: [
      {
        match: "**/*.config.{js,ts}",
        enforce: {
          files: [
            "<camel-case>.config",
            "<kebab-case>.config",
            "<pascal-case>.config",
          ],
        },
      },
      {
        match: "src/components/**/*.tsx",
        enforce: {
          files: {
            type: "all",
            patterns: ["<pascal-case>*", "*{Component,Container,Provider}"],
          },
        },
      },
      {
        match: "src/features/*/**/*.{ts,tsx}",
        enforce: {
          files: ["<camel-case>", "<pascal-case>"],
          folder: {
            type: "any",
            patterns: ["<kebab-case>", "<snake-case>"],
          },
        },
      },
    ],
  });

  t.expect({
    valid: [
      "webpack.config.js",
      "WebPack.config.ts",
      "webpack-config.config.ts",
      "src/components/UserComponent.tsx",
      "src/components/AuthContainer.tsx",
      "src/features/user-auth/userService.ts",
      "src/features/data_processor/DataProcessor.tsx",
    ],
    invalid: [
      "WEBPACK.config.ts",
      "src/components/UserManager.tsx",
      "src/components/authComponent.tsx",
      "src/features/UserAuth/service.ts",
    ],
  });
});

describe("Prohibited Patterns", () => {
  const t = createTester([
    {
      chaining: "apply-and-continue",
      rules: [
        {
          match: "src/components/*/index.{js,jsx,ts,tsx}",
          enforce: { files: "error" },
        },
        {
          match: "src/**/*[A-Z]*/**",
          enforce: { folder: "error" },
        },
        {
          match: "src/utils/**/*{Helper,Util}*.ts",
          enforce: { files: "error" },
        },
      ],
    },
    {
      rules: [
        {
          match: "**/*",
          enforce: { files: "<anything>" },
        },
      ],
    },
  ]);

  t.expect({
    valid: [
      "src/components/button/Button.tsx",
      "src/utils/date-formatter.ts",
      "src/utils/arrayProcessor.ts",
    ],

    error: "PROHIBITED",
    invalid: [
      "src/components/button/index.tsx",
      "src/components/Button/Button.tsx",
      "src/utils/DateHelper.ts",
    ],
  });
});

describe("Multiple Rule Sets", () => {
  const t = createTester([
    {
      scope: "packages/core/**",
      rules: [{ match: "**/*.ts", enforce: { files: "<snake-case>" } }],
    },
    {
      scope: "packages/ui/**",
      rules: [
        { match: "**/*.tsx", enforce: { files: "<pascal-case>" } },
        { match: "**/hooks/*.ts", enforce: { files: "use<pascal-case>" } },
      ],
    },
    {
      rules: [
        { match: "**/*.{js,ts}", enforce: { files: "<camel-case>" } },
        { match: "**/*.{jsx,tsx}", enforce: { files: "<pascal-case>" } },
      ],
    },
  ]);

  t.expect({
    valid: [
      "packages/core/database_client.ts",
      "packages/core/utils/index.ts",
      "packages/ui/Button.tsx",
      "packages/ui/hooks/useAuth.ts",
      "src/utils/helpers.js",
      "src/components/Header.jsx",
    ],
    invalid: [
      "packages/core/databaseClient.ts",
      "packages/core/utils/Index.ts",
      "packages/ui/button.tsx",
      "packages/ui/hooks/authHook.ts",
    ],
  });
});

describe("Rule Sets Chaining", () => {
  const t = createTester([
    {
      id: "strict-components",
      scope: "src/components/**",
      chaining: "apply-and-stop",
      rules: [
        {
          match: "**/*.tsx",
          enforce: { files: "<pascal-case>" },
        },
      ],
    },
    {
      id: "general-rules",
      chaining: "apply-and-continue",
      rules: [
        {
          match: "**/*.ts",
          enforce: { files: "<camel-case>" },
        },
      ],
    },
  ]);

  t.expect({
    valid: [
      "src/components/Button.tsx",
      "src/components/UserCard.tsx",
      "src/utils/helpers.ts",
      "src/services/authService.ts",
    ],
    invalid: [
      "src/components/button.tsx",
      "src/components/user-card.tsx",
      "src/utils/Helpers.ts",
    ],
  });
});

describe("Next.js App Router", () => {
  const t = createTester({
    id: "Next.js App Router",
    scope: "src/app/**/*",
    rules: {
      match: "**/*",
      enforce: {
        files: "<kebab-case>",
        folder: "<nextjs-app-router-folder>",
      },
    },
  });

  t.expect({
    valid: [
      "src/app/dashboard/page.tsx",
      "src/app/users/[id]/page.tsx",
      "src/app/(auth)/login/page.tsx",
      "src/app/api/users/route.ts",
    ],
    invalid: ["src/app/dashboard/Page.tsx", "src/app/UserDashboard/page.tsx"],
  });
});

describe("Next.js Pages Router", () => {
  const t = createTester({
    id: "Next.js Pages Router",
    rules: {
      match: "pages/**/*.{js,jsx,ts,tsx}",
      enforce: {
        files: "<nextjs-page-router-file>",
      },
    },
  });

  t.expect({
    valid: [
      "pages/_app.tsx",
      "pages/_document.tsx",
      "pages/blog/[slug].tsx",
      "pages/api/auth-handler.ts",
    ],
    invalid: ["pages/AboutUs.tsx", "pages/api/authHandler.ts"],
  });
});

describe("Astro Configuration", () => {
  const t = createTester({
    id: "Astro Routes",
    rules: {
      match: "src/pages/**/*.astro",
      enforce: { files: "<astro-route>", folder: "<astro-route>" },
    },
  });

  t.expect({
    valid: [
      "src/pages/index.astro",
      "src/pages/blog/[slug].astro",
      "src/pages/docs/[...path].astro",
      "src/pages/404.astro",
    ],
    invalid: ["src/pages/Index.astro", "src/pages/blog/Slug.astro"],
  });
});

describe("Component File Must Match Folder Name", () => {
  const t = createTester({
    rules: [
      {
        match: "src/components/*/*.{jsx,tsx}",
        enforce: { files: "<dir>" },
      },
      {
        match: "src/components/*/**",
        enforce: { folder: "<pascal-case>" },
      },
      {
        match: "src/components/*/*.module.css",
        enforce: { files: "<dir>.module" },
      },
    ],
  });

  t.expect({
    valid: [
      "src/components/Button/Button.tsx",
      "src/components/UserProfile/UserProfile.jsx",
      "src/components/Button/Button.module.css",
      "src/components/Header/Header.module.css",
    ],
    invalid: [
      "src/components/Button/index.tsx",
      "src/components/button/button.tsx",
      "src/components/UserProfile/Profile.tsx",
      "src/components/Button/styles.module.css",
    ],
  });
});

describe("React Hooks Naming", () => {
  const t = createTester({
    rules: [
      {
        match: "src/hooks/**/*.{js,ts}",
        enforce: { files: "use<pascal-case>" },
      },
      {
        match: "src/components/*/hooks/*.{js,ts}",
        enforce: { files: "use<pascal-case>" },
      },
      {
        match: "src/shared/hooks/**/*.{js,ts}",
        enforce: {
          files: ["use<pascal-case>", "use<pascal-case>Hook"],
          folder: "<camel-case>",
        },
      },
    ],
  });

  t.expect({
    valid: [
      "src/hooks/useUserData.js",
      "src/hooks/useShoppingCart.ts",
      "src/components/Button/hooks/useButtonState.js",
      "src/shared/hooks/useAuthenticationHook.js",
    ],
    invalid: [
      "src/hooks/UserData.js",
      "src/hooks/use_shopping_cart.js",
      "src/hooks/use-shopping-cart.ts",
      "src/components/Button/hooks/buttonState.js",
    ],
  });
});

describe("Test File Organization", () => {
  const t = createTester({
    rules: [
      {
        match: "**/*.{test,spec}.{js,ts,jsx,tsx}",
        enforce: { folder: "**/__tests__" },
      },
      {
        match: "**/__tests__/*",
        enforce: {
          files: "<kebab-case>.{test,spec}",
        },
      },
    ],
  });

  t.expect({
    valid: ["src/__tests__/button.test.js", "src/__tests__/utils.spec.ts"],
    invalid: ["src/__tests__/button.js", "src/__tests__/Button.test.js"],
  });
});

describe("Different Conventions by File Type", () => {
  const t = createTester({
    rules: [
      {
        match: "**/*.ts",
        enforce: { files: "<camel-case>" },
      },
      {
        match: "**/*.module.{css,scss}",
        enforce: { files: "<pascal-case>.module" },
      },
      {
        match: "**/*.{test,spec}.{js,ts}",
        enforce: { files: "*.*" },
      },
      {
        match: "**/*.stories.{js,jsx,ts,tsx}",
        enforce: { files: "<pascal-case>.stories" },
      },
      {
        match: {
          type: "all",
          patterns: ["**/*.{jsx,tsx}", "!**/*.stories.{jsx,tsx}"],
        },
        enforce: { files: "<pascal-case>" },
      },
    ],
  });

  t.expect({
    valid: [
      "Button.jsx",
      "UserProfile.tsx",
      "userService.ts",
      "dataProcessor.ts",
      "Button.module.css",
      "Header.module.scss",
      "userService.test.js",
      "Button.stories.tsx",
    ],
    invalid: [
      "button.jsx",
      "UserService.ts",
      "button.module.css",
      "button.stories.tsx",
    ],
  });
});

describe("Partial Path and Filename Matching", () => {
  const t = createTester({
    rules: [
      {
        match: "**/*config*",
        enforce: { files: ["<kebab-case>", "<kebab-case>.config"] },
      },
      {
        match: "**/test-*",
        enforce: { files: "test-<kebab-case>" },
      },
      {
        match: "**/*.utils.{js,ts}",
        enforce: { files: "<camel-case>.utils" },
      },
    ],
  });

  t.expect({
    valid: [
      "webpack.config.js",
      "database-config.ts",
      "test-user-service.js",
      "test-api-client.ts",
      "stringUtils.utils.js",
      "dateFormatter.utils.ts",
    ],
    invalid: [
      "Webpack-config.js",
      "test-user_service.js",
      "StringUtils.utils.js",
    ],
  });
});

describe("Prevent Index Files", () => {
  const t = createTester([
    {
      id: "prohibit-index",
      chaining: "apply-and-continue",
      rules: [
        {
          match: "src/**/index.{js,jsx,ts,tsx}",
          enforce: { files: "error" },
        },
      ],
    },
    {
      id: "allow-anything",
      rules: [
        {
          match: "**/*",
          enforce: { files: "<anything>" },
        },
      ],
    },
  ]);

  t.expect({
    valid: [
      "src/components/Button/Button.tsx",
      "src/components/Header/Header.jsx",
      "src/utils/validation/emailValidator.ts",
      "src/services/auth/authService.js",
    ],
    invalid: [
      "src/components/Button/index.tsx",
      "src/components/Modal/index.js",
      "src/utils/helpers/index.ts",
      "src/services/api/index.js",
    ],
    error: ["PROHIBITED"],
  });
});
