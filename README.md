# eslint-plugin-naming-conventions

An advanced ESLint plugin that enforces consistent file and folder naming conventions across your codebase. Features flexible rule configuration, boolean logic in matchers, dynamic runtime aliases, monorepo support with rule chaining, and powerful glob pattern matching.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
  - [Multiple Rules](#multiple-rules)
  - [Folder Naming](#folder-naming)
  - [Built-in Naming Patterns](#built-in-naming-patterns)
  - [Custom Aliases](#custom-aliases)
  - [Runtime Aliases](#runtime-aliases)
  - [Pattern Matching with Micromatch](#pattern-matching-with-micromatch)
  - [Boolean Logic in Matchers](#boolean-logic-in-matchers)
  - [Boolean Logic in Enforce Patterns](#boolean-logic-in-enforce-patterns)
  - [Prohibited Patterns](#prohibited-patterns)
  - [Multiple Rule Sets](#multiple-rule-sets)
  - [Processor Configuration](#processor-configuration)
- [Recipes](#recipes)
  - [Next.js App Router](#nextjs-app-router)
  - [Next.js Pages Router](#nextjs-pages-router)  
  - [Astro Configuration](#astro-configuration)
  - [Prevent Index Files](#prevent-index-files)
  - [Component File Must Match Folder Name](#component-file-must-match-folder-name)
  - [React Hooks Naming](#react-hooks-naming)
  - [Test File Organization](#test-file-organization)
  - [Different Conventions by File Type](#different-conventions-by-file-type)
  - [Partial Path and Filename Matching](#partial-path-and-filename-matching)
  - [Monorepo Configuration](#monorepo-configuration)
  - [Handling Unmatched Files](#handling-unmatched-files)
- [Debugging & Troubleshooting](#debugging--troubleshooting)
- [Acknowledgments](#acknowledgments)
- [License](#license)

## Requirements

- ESLint >= 9.0.0
- [ESLint flat config][eslint-flat-config]

## Installation

```bash
# pnpm
pnpm add --save-dev eslint-plugin-naming-conventions

# npm
npm install --save-dev eslint-plugin-naming-conventions

# yarn
yarn add --dev eslint-plugin-naming-conventions
```

## Quick Start

Add the plugin to your ESLint flat config (e.g., `eslint.config.mts`):

```ts
import namingConventions from "eslint-plugin-naming-conventions";

export default [
  {
    plugins: {
      "naming-conventions": namingConventions,
    },
  },
  {
    rules: {
      "naming-conventions/enforce": [
        "error",
        {
          rules: {
            match: "**/*.{js,ts}",
            enforce: { files: "<camel-case>" }
          }
        }
      ]
    }
  }
];

// Results:
// ✅ userService.js
// ✅ dataProcessor.ts
// ✅ authHelper.js
// ❌ UserService.ts (must be camelCase)
// ❌ data-processor.js (must be camelCase)
// ❌ auth_helper.ts (must be camelCase)
```

## Features

### Multiple Rules

Add multiple rules to implement different naming conventions for different file types.

```ts
{
  rules: {
    "naming-conventions/enforce": [
      "error",
      {
        rules: [
          {
            match: "**/*.{js,ts}",
            enforce: { files: "<camel-case>" }
          },
          {
            match: "**/*.{jsx,tsx}",
            enforce: { files: "<pascal-case>" }
          }
        ]
      }
    ]
  }
}

// Results:
// ✅ userProfile.js
// ✅ shoppingCart.ts
// ✅ UserProfile.jsx
// ✅ ShoppingCart.tsx
// ❌ UserProfile.js (must be camelCase)
// ❌ user-profile.ts (must be camelCase)
// ❌ userProfile.jsx (must be PascalCase)
// ❌ shopping-cart.tsx (must be PascalCase)
```

**Note**: Each file is checked against ALL defined rules. If a file matches multiple rules, all `enforce` naming conventions will be validated. For more flexibility in how rules are applied, see [Multiple Rule Sets](#multiple-rule-sets).

### Folder Naming

The `enforce` configuration supports folder naming patterns.

```ts
{
  rules: {
    "naming-conventions/enforce": [
      "error",
      {
        rules: [
          // Enforce PascalCase for component folders
          {
            match: "src/components/*/*",
            enforce: { folder: "<pascal-case>" }
          },
          // Enforce kebab-case for route folders
          {
            match: "src/routes/*/*",
            enforce: { folder: "<kebab-case>" }
          }
        ]
      }
    ]
  }
}

// Results:
// ✅ src/components/Button/Button.tsx (folder: Button)
// ✅ src/components/UserProfile/index.tsx (folder: UserProfile)
// ✅ src/routes/user-profile/page.tsx (folder: user-profile)
// ✅ src/routes/shopping-cart/layout.tsx (folder: shopping-cart)
// ❌ src/components/button/Button.tsx (folder must be PascalCase)
// ❌ src/components/user-profile/index.tsx (folder must be PascalCase)
// ❌ src/routes/UserProfile/page.tsx (folder must be kebab-case)
// ❌ src/routes/ShoppingCart/layout.tsx (folder must be kebab-case)
```

**Note**: The `match` pattern always targets files, so to enforce folder naming, you match the files within those folders. The `folder` property then checks the immediate parent folder of the matched file.

### Built-in Naming Patterns

The plugin provides several pre-defined naming patterns:

| Alias | Description | Example |
|-------|-------------|---------|
| `<camel-case>` | Camel case | `userProfile`, `shoppingCart` |
| `<pascal-case>` | Pascal case | `UserProfile`, `ShoppingCart` |
| `<kebab-case>` | Kebab case | `user-profile`, `shopping-cart` |
| `<snake-case>` | Snake case | `user_profile`, `shopping_cart` |
| `<flat-case>` | Flat case | `userprofile`, `shoppingcart` |
| `<anything>` | Match any name | `*` (any pattern) |

You can combine built-in patterns with other static or dynamic segments to create more specific rules:

```ts
{
  rules: {
    // Hook files must start with `use`
    match: "src/hooks/**",
    enforce: { files: "use<pascal-case>" }
  }
}

// Results:
// ✅ src/hooks/useAuth.js
// ✅ src/hooks/useUserData.ts
// ✅ src/hooks/useShoppingCart.js
// ❌ src/hooks/Auth.js (missing 'use' prefix)
// ❌ src/hooks/useauth.js (must be usePascalCase)
// ❌ src/hooks/use-auth.js (must be usePascalCase)
```

#### Framework-Specific Aliases

| Alias | Description | Example |
|-------|-------------|---------|
| `<nextjs-app-router-folder>` | Next.js App Router folders | `[slug]`, `(group)`, `@parallel` |
| `<nextjs-page-router-file>` | Next.js Pages Router files | `_app`, `_document`, `[...slug]` |
| `<astro-route>` | Astro route files | `[postSlug]`, `[...auth]` |

### Runtime Aliases

The plugin supports dynamic patterns that resolve based on file context:

| Alias | Description | Example |
|-------|-------------|---------|
| `<dir>` | Parent directory name | `Button/index.tsx` → `Button` |

Example usage:

```ts
{
  rules: [
    {
      // Component file must match its folder name
      match: "src/components/*/*.tsx",
      enforce: { files: "<dir>" }
    },
    {
      // Style file must match component name and have a .module suffix
      match: "src/components/*/*.css",
      enforce: { files: "<dir>.module" }
    },
  ]
}

// Results:
// ✅ src/components/Button/Button.tsx
// ✅ src/components/Header/Header.tsx
// ✅ src/components/Button/Button.module.css
// ❌ src/components/Button/index.tsx (must be Button.tsx)
// ❌ src/components/Header/header.tsx (must match folder: Header.tsx)
// ❌ src/components/Button/styles.module.css (must be Button.module.css)
```

#### Positional Capture Groups
Additionally, the plugin supports positional capture group aliases starting from index 0. For example, if your match pattern is `src/*/*.tsx` and the file path is `src/components/Button.tsx`, then `<0>` resolves to `components` and `<1>` resolves to `Button`. Read more about glob capture groups in the [micromatch][micromatch-capture] documentation.


### Custom Aliases

Define reusable patterns in your ESLint settings:

```ts
export default [
  {
    settings: {
      "naming-conventions": {
        aliases: {
          "component": "<pascal-case>{Component,Container,Provider}",
        }
      }
    }
  },
  {
    rules: {
      "naming-conventions/enforce": [
        "error",
        {
          rules: [
            {
              match: "src/components/**/*.tsx",
              enforce: { files: "<component>" }
            },
          ]
        }
      ]
    }
  }
];

// Results:
// ✅ src/components/UserComponent.tsx
// ✅ src/components/AuthContainer.tsx
// ✅ src/components/ThemeProvider.tsx
// ❌ src/components/UserManager.tsx (doesn't end with Component/Container/Provider)
// ❌ src/components/useAuthComponent.tsx (doesn't start with PascalCase)
```

### Pattern Matching with Micromatch

The plugin uses [micromatch][micromatch] for powerful glob pattern matching. Here are common patterns you can use:

| Pattern | Description | Example Match |
|---------|-------------|---------------|
| `*` | Matches any characters (except path separators) | `*.js` → `file.js` |
| `**` | Matches any characters including path separators | `**/*.js` → `src/utils/file.js` |
| `?` | Matches exactly one character | `file?.js` → `file1.js` |
| `[abc]` | Matches any character in brackets | `file[12].js` → `file1.js`, `file2.js` |
| `{a,b}` | Matches any of the comma-separated patterns | `*.{js,ts}` → `file.js`, `file.ts` |
| `!(pattern)` | Matches anything except the pattern | `!(*.test).js` → `file.js` (not `file.test.js`) |
| `+(pattern)` | Matches one or more occurrences | `+(foo).js` → `foo.js`, `foofoo.js` |
| `*(pattern)` | Matches zero or more occurrences | `*(foo).js` → `.js`, `foo.js` |
| `?(pattern)` | Matches zero or one occurrence | `?(foo).js` → `.js`, `foo.js` |
| `@(pattern)` | Matches exactly one of the patterns | `@(foo|bar).js` → `foo.js`, `bar.js` |

Complex examples:

```ts
{
  rules: [
    {
      // Match TypeScript files but exclude test files
      match: "**/!(*.test).ts",
      enforce: { files: "<kebab-case>" }
    },
    {
      // Match component files with optional test/story suffix
      match: "src/components/**/*.tsx",
      enforce: { files: "<pascal-case>?(.test|.stories)" }
    },
    {
      // Match API routes with version numbers
      match: "api/v[0-9]/**/*.ts",
      enforce: { files: "<kebab-case>" }
    }
  ]
}

// Results:
// ✅ user-service.ts
// ✅ src/components/Button.tsx
// ✅ src/components/Button.test.tsx
// ✅ src/components/Header.stories.tsx
// ✅ api/v1/user-profile.ts
// ✅ api/v2/shopping-cart.ts
// ❌ userService.ts (non-test files must be kebab-case)
// ❌ userService.test.ts (test files not allowed for *.ts)
// ❌ src/components/button.tsx (must be PascalCase)
// ❌ src/components/Button.spec.tsx (only .test or .stories allowed)
// ❌ api/v1/userProfile.ts (must be kebab-case, 2 rules match this file)
```

You can test your patterns with online tools like the [Digital Ocean Glob Tool][glob-tester].

**Note:** If you find yourself writing complex glob patterns, consider using [Boolean Logic in Matchers](#boolean-logic-in-matchers) and [Multiple Rule Sets](#multiple-rule-sets) for better readability.

### Boolean Logic in Matchers

Use matcher objects for complex matching logic with boolean operators:

```ts
{
  rules: [
    {
      // Match TypeScript files NOT in test or mock folders
      match: {
        type: "all",  // all patterns must match
        patterns: [
          "**/*.ts",
          "!**/__tests__/**",
          "!**/__mocks__/**",
          "!**/*.test.ts",
          "!**/*.spec.ts",
          "!**/*.mock.ts"
        ]
      },
      enforce: { files: "<camel-case>" }
    },
    {
      // Match files in EITHER components OR containers
      match: {
        type: "any",  // any pattern can match
        patterns: [
          "src/components/**/*.tsx",
          "src/containers/**/*.tsx"
        ]
      },
      enforce: { files: "<pascal-case>" }
    },
  ]
}

// Results:
// ✅ src/services/userService.ts
// ✅ src/api/dataProcessor.ts
// ✅ src/components/Button.tsx
// ✅ src/containers/UserDashboard.tsx
// ❌ src/services/UserService.ts (must be camelCase)
// ❌ src/components/button.tsx (must be PascalCase)
// ❌ src/__tests__/userService.ts (excluded from rule)
// ❌ userService.test.ts (excluded from rule)
```

#### Matcher Types

- `any` (default): Match if ANY pattern matches
- `all`: Match only if ALL patterns match

The default matcher type is `any`, so you can also provide an array of patterns directly for simple OR logic:

```ts
{
  match: ["src/components/**/*.tsx", "src/containers/**/*.tsx"],
  enforce: { files: "<pascal-case>" }
}
```

### Boolean Logic in Enforce Patterns

Just like `match`, the `enforce.files` and `enforce.folder` properties support the same flexible pattern matching:

```ts
{
  rules: [
    {
      // Simple array - allows any of these patterns (OR logic)
      match: "**/*.config.{js,ts}",
      enforce: {
        files: [
          "<camel-case>.config",
          "<kebab-case>.config",
          "<pascal-case>.config"
        ]
      }
    },
    {
      // Using matcher object for complex logic
      match: "src/components/**/*.tsx",
      enforce: {
        files: {
          type: "all",  // File must satisfy ALL patterns
          patterns: [
            "<pascal-case>*",  // Must start with PascalCase
            "*{Component,Container,Provider}"  // Must end with specific suffix
          ]
        }
      }
    },
    {
      // Different patterns for files and folders
      match: "src/features/*/**/*.{ts,tsx}",
      enforce: {
        // default type is "any"
        files: ["<camel-case>", "<pascal-case>"],
        folder: {
          type: "any",
          patterns: ["<kebab-case>", "<snake-case>"]
        }
      }
    }
  ]
}

// Results:
// ✅ webpack.config.js (matches camel-case pattern)
// ✅ WebPack.config.ts (matches pascal-case pattern)
// ✅ webpack-config.config.ts (matches kebab-case pattern)
// ✅ src/components/UserComponent.tsx (PascalCase + Component suffix)
// ✅ src/components/AuthContainer.tsx (PascalCase + Container suffix)
// ✅ src/features/user-auth/userService.ts (kebab folder, camel file)
// ✅ src/features/data_processor/DataProcessor.tsx (snake folder, pascal file)
// ❌ WEBPACK.config.ts (doesn't match any allowed pattern)
// ❌ src/components/UserManager.tsx (doesn't end with required suffix)
// ❌ src/components/authComponent.tsx (doesn't start with PascalCase)
// ❌ src/features/UserAuth/service.ts (folder must be kebab or snake case)
```

The `enforce` properties support the same matcher types as `match` - see [Matcher Types](#matcher-types) for detailed explanations of `any` and `all` types.

### Prohibited Patterns

You can make use of [Multiple Rule Sets](#multiple-rule-sets) and 
[`apply-and-continue` Chaining Control](#rule-sets-chaining) to create a configuration that prohibits certain patterns in your file or folder names across your codebase.

```ts
export default [
  {
    plugins: {
      "naming-conventions": namingConventions,
    },
  },
  
  {
    rules: {
      "naming-conventions/enforce": [
        "error",
        {
          // Must use "apply-and-continue" to continue to next rule set
          chaining: "apply-and-continue",
          rules: [
            {
              // Prohibit index files in component folders
              match: "src/components/*/index.{js,jsx,ts,tsx}",
              enforce: { files: "error" }
            },
            {
              // Prohibit uppercase folder names
              match: "src/**/*[A-Z]*/**",
              enforce: { folder: "error" }
            },
            {
              // Prohibit files with "Helper" or "Util" in name
              match: "src/utils/**/*{Helper,Util}*.ts",
              enforce: { files: "error" }
            }
          ]
        },
        {
          rules: [
            // Rest of your naming conventions
          ]
        }
      ]
    }
  },
];

// Results:
// ✅ src/components/button/Button.tsx
// ✅ src/utils/date-formatter.ts
// ✅ src/utils/arrayProcessor.ts
// ❌ src/components/button/index.tsx (index files prohibited)
// ❌ src/components/Button/Button.tsx (uppercase folder prohibited)
// ❌ src/utils/DateHelper.ts (Helper prohibited)
```

### Multiple Rule Sets

For more complex projects like monorepos, you can pass multiple configuration objects as an array to a single Eslint rule. This is useful when you need different rules for different parts of your codebase - such as different packages with different conventions, legacy code gradually migrating to new naming conventions, or different teams with different preferences:

```ts
export default [
  {
    plugins: {
      "naming-conventions": namingConventions,
    },
  },
  
  {
    rules: {
      "naming-conventions/enforce": [
        "error",
        {
          id: "core-package",
          scope: "packages/core/**",
          rules: {
            match: "**/*.ts", 
            enforce: { files: "<snake-case>" }
          }
        },
        {
          id: "ui-package",
          scope: "packages/ui/**",
          rules: [
            { match: "**/*.tsx", enforce: { files: "<pascal-case>" } },
            { match: "**/hooks/*.ts", enforce: { files: "use<pascal-case>" } }
          ]
        },
        {
          id: "other-files",
          rules: [
            { match: "**/*.{js,ts}", enforce: { files: "<camel-case>" } },
            { match: "**/*.{jsx,tsx}", enforce: { files: "<pascal-case>" } }
          ]
        }
      ]
    }
  }
];

// Results:
// ✅ packages/core/database_client.ts (snake_case)
// ✅ packages/core/utils/index.ts
// ✅ packages/ui/Button.tsx (PascalCase)
// ✅ packages/ui/hooks/useAuth.ts (use + PascalCase)
// ✅ src/utils/helpers.js (camelCase - general rule)
// ✅ src/components/Header.jsx (PascalCase - general rule)
// ❌ packages/core/databaseClient.ts (must be snake_case)
// ❌ packages/core/utils/Index.ts (must be 'index')
// ❌ packages/ui/button.tsx (must be PascalCase)
// ❌ packages/ui/hooks/authHook.ts (must start with 'use')
```

#### Scope

The `scope` property acts as a [matcher](#matcher-types) to limit which files a rule set applies to. When specified, the rule set only processes files that match the scope pattern.

**Important Behavior:** If a file falls within a rule set's scope, processing stops after that rule set (even if no rules matched) due to the default `apply-and-stop` chaining behavior.

```ts
{
  id: "test-files",
  scope: {
    type: "all",
    patterns: [
      "**/*.test.{js,ts,jsx,tsx}",
      "!**/examples/**"
    ]
  },
  rules: {
    match: "**/*",
    enforce: { files: "<kebab-case>.test" }
  }
}
```

#### Rule Sets Chaining

When using multiple rule sets, you can control the processing flow with the `chaining` option. This determines whether processing continues to subsequent rule sets or stops after the current one.

**Chaining Options:**

- **`apply-and-stop`** (default) - Stop processing after the current rule set
  - If a file matches the rule set's `scope`, processing stops immediately
  - This happens even if no rules within the set matched the file
  - Use this for exclusive rule sets where you want clear boundaries

- **`apply-and-continue`** - Continue to the next rule set
  - Processing continues regardless of matches in the current set
  - Useful for layered rules (e.g., global validations + specific requirements)
  - Allows multiple rule sets to apply to the same files

**When to use each option:**
- Use `apply-and-continue` for cross-cutting concerns like test organization, prohibited patterns, or global validations
- Use `apply-and-stop` for mutually exclusive scopes like different apps in a monorepo or different coding standards


```ts
{
  rules: {
    "naming-conventions/enforce": [
      "error",
      [
        {
          id: "test-organization",
          chaining: "apply-and-continue", // Continue to app-specific rules
          rules: {
            // Ensure test files are in __tests__ folders
            match: "**/*.{test,spec}.{js,ts,jsx,tsx}",
            enforce: { 
              files: "*.{test,spec}",
              folder: "__tests__"
            }
          }
        },
        {
          id: "legacy-app",
          scope: "apps/legacy/**",
          rules: {
            match: "**/*.{js,ts}",
            enforce: { files: "<snake-case>" }
          }
        },
        {
          id: "modern-app", 
          scope: "apps/dashboard/**",
          rules: {
            match: "**/*.{js,ts}",
            enforce: { files: "<kebab-case>" }
          }
        }
      ]
    ]
  }
}

// Results:
// ✅ apps/legacy/user_service.js (snake_case - legacy-app rule set)
// ✅ apps/dashboard/user-service.js (kebab-case - modern-app rule set)
// ✅ apps/legacy/__tests__/user_service.test.js (test organization + snake_case)
// ✅ apps/dashboard/__tests__/user-service.test.js (test organization + kebab-case)
// ❌ apps/legacy/userService.js (must be snake_case - legacy-app rule set)
// ❌ apps/dashboard/user_service.js (must be kebab-case - modern-app rule set)
// ❌ apps/legacy/tests/user_service.test.js (test files must be in __tests__ folder)
// ❌ apps/dashboard/user-service.spec.js (test files must be in __tests__ folder)
// Note: Test organization rule runs first, then app-specific rules apply based on scope
```


##### Scope and `apply-and-stop` Behavior Matrix

The table below shows how scope and rule matching interact with the default `apply-and-stop` behavior:

```ts
{
  id: "test-files",
  scope: {
    type: "all",
    patterns: [
      "**/*.test.{js,ts,jsx,tsx}",
      "!**/examples/**"
    ]
  },
  rules: {
    match: "**/*",
    enforce: { files: "<kebab-case>.test" }
  }
}
```

| File Path | Within Scope? | Rule Matches? | Continue to Next Rule Set? |
|-----------|---------------|---------------|---------------------------|
| `src/auth.test.ts` | ✅ Yes | ✅ Yes | ❌ No |
| `src/auth.test.js` | ✅ Yes | ✅ Yes | ❌ No |
| `src/AUTH.TEST.ts` | ✅ Yes | ❌ No (wrong case) | ❌ No |
| `examples/demo.test.ts` | ❌ No (out of scope) | N/A | ✅ Yes |
| `src/utils.ts` | ❌ No (out of scope) | N/A | ✅ Yes |


### Processor Configuration

The processor enables ESLint to check file types that don't have built-in processors. This is useful when you want to apply naming conventions to configuration files, documentation, images, and other non-code assets that aren't typically processed by other ESLint plugins.

```ts
export default [
  {
    plugins: {
      "naming-conventions": namingConventions,
    },
  },
  
  // Add processor for file types that need naming convention checks
  {
    files: ["**/*.{yaml,yml,json,md,css,svg,png,jpg,webp}"],
    processor: "naming-conventions/processor"
  },
  
  {
    rules: {
      "naming-conventions/enforce": [
        "error",
        {
          rules: [
            // Configuration files should be kebab-case
            {
              match: "**/*.{json,yaml,yml}",
              enforce: { files: "<kebab-case>" }
            },
            // Documentation files should be kebab-case  
            {
              match: "**/*.md",
              enforce: { files: "<kebab-case>" }
            },
            // Images and assets should be kebab-case
            {
              match: "**/*.{svg,png,jpg,jpeg,webp}",
              enforce: { files: "<kebab-case>" }
            },
            // CSS files should be kebab-case
            {
              match: "**/*.css",
              enforce: { files: "<kebab-case>" }
            }
          ]
        }
      ]
    }
  }
];

// Results:
// ✅ package.json
// ✅ docker-compose.yml  
// ✅ api-documentation.md
// ✅ user-avatar.png
// ✅ main-styles.css
// ❌ packageLock.json (must be kebab-case)
// ❌ Docker_Compose.yml (must be kebab-case)
// ❌ API_Documentation.md (must be kebab-case)
// ❌ UserAvatar.png (must be kebab-case)
```

## Recipes

Specific configuration examples for common use cases.

### Next.js App Router

Configure naming conventions for Next.js 13+ App Router projects. The plugin provides built-in support for App Router's special folder conventions including dynamic routes (`[slug]`), route groups (`(group)`), parallel routes (`@parallel`), and intercepting routes (`(..)folder`).

Use the `<nextjs-app-router-folder>` alias to validate these special folder naming patterns alongside your custom naming requirements.

```ts
export default [
  {
    plugins: {
      "naming-conventions": namingConventions,
    },
  },
  {
    rules: {
      "naming-conventions/enforce": [
        "error",
        {
          id: "Next.js App Router",
          scope: "src/app/**/*",
          rules: {
            match: "**/*",
            enforce: {
              files: "<kebab-case>",
              folder: "<nextjs-app-router-folder>"
            }
          }
        },
        {
          rules: [
            // Rest of your naming conventions
          ]
        }
      ]
    }
  }
];

// Results:
// ✅ app/dashboard/page.tsx
// ✅ app/users/[id]/page.tsx (folder: [id])
// ✅ app/(auth)/login/page.tsx (folder: (auth))
// ✅ app/api/users/route.ts
// ❌ app/dashboard/Page.tsx (must be lowercase 'page')
// ❌ app/UserDashboard/page.tsx (folder must be kebab-case or Next.js pattern)
```

### Next.js Pages Router  

Configure naming conventions for traditional Next.js Pages Router projects. The plugin recognizes Pages Router's special files (`_app`, `_document`, `_error`) and dynamic routing patterns (`[id]`, `[...slug]`, `[[...optional]]`).

Use the `<nextjs-page-router-file>` alias to accommodate these framework-specific naming requirements while enforcing consistent naming for your application pages.

```ts
export default [
  {
    plugins: {
      "naming-conventions": namingConventions,
    },
  },
  {
    rules: {
      "naming-conventions/enforce": [
        "error",
        {
          id: "Next.js Pages Router",
          rules: {
            match: "pages/**/*.{js,jsx,ts,tsx}",
            enforce: { 
              files: "<nextjs-page-router-file>"
            }
          }
        },
        {
          rules: [
            // Rest of your naming conventions
          ]
        }
      ]
    }
  }
];

// Results:
// ✅ pages/_app.tsx
// ✅ pages/_document.tsx
// ✅ pages/blog/[slug].tsx
// ✅ pages/api/auth-handler.ts
// ❌ pages/AboutUs.tsx (must be kebab-case)
// ❌ pages/api/authHandler.ts (must be kebab-case)
```

### Astro Configuration

Configure naming conventions for Astro projects with built-in support for Astro's file-based routing system. The plugin understands Astro's route patterns including static routes, dynamic routes (`[slug]`), rest parameters (`[...path]`), and special files like `404.astro`.

The `<astro-route>` alias matches these framework-specific routing patterns.

```ts
export default [
  {
    plugins: {
      "naming-conventions": namingConventions,
    },
  },
  {
    rules: {
      "naming-conventions/enforce": [
        "error",
        {
          id: "Astro Routes",
          rules: {
            match: "src/pages/**/*.astro",
            enforce: { files: "<astro-route>", folder: "<astro-route>" }
          }
        },
        {
          rules: [
            // Rest of your naming conventions
          ]
        }
      ]
    }
  }
];

// Results:
// ✅ src/pages/index.astro
// ✅ src/pages/blog/[slug].astro
// ✅ src/pages/docs/[...path].astro
// ✅ src/pages/api/webhook.ts
// ❌ src/pages/Index.astro (must be lowercase)
// ❌ src/pages/blog/Slug.astro (dynamic routes use brackets)
```

### Prevent Index Files

Improve code clarity by prohibiting `index` files and enforcing explicit naming. This approach makes imports more descriptive and prevents "barrel export" patterns that can hurt bundle size and tree-shaking.

**Benefits:**
- More explicit imports: `import Button from './Button/Button'` instead of `import Button from './Button'`
- Better IDE navigation and search functionality
- Clearer file structure and purpose
- Improved bundle analysis and tree-shaking

Use [Multiple Rule Sets](#multiple-rule-sets) with `apply-and-continue` chaining to first check for prohibited index files, then apply your standard naming conventions:

```ts
export default [
  {
    plugins: {
      "naming-conventions": namingConventions,
    },
  },
  {
    rules: {
      "naming-conventions/enforce": [
        "error",
        {
          id: "prohibit-index",
          chaining: "apply-and-continue",
          rules: [
            {
              match: "src/**/index.{js,jsx,ts,tsx}",
              enforce: { files: "error" }
            }
          ]
        },
        // Second rule set: Enforce standard naming conventions
        {
          id: "standard-naming",
          rules: [
            {
              match: "src/components/**/*",
              enforce: {
                files: "<pascal-case>",
                folder: "<pascal-case>"
              }
            },
            {
              match: "src/{utils,services,hooks}/**/*",
              enforce: {
                files: "<camel-case>",
                folder: "<kebab-case>"
              }
            }
          ]
        }
      ]
    }
  }
];

// Results:
// ✅ src/components/Button/Button.tsx
// ✅ src/components/Modal/Modal.jsx
// ✅ src/utils/validation/emailValidator.ts
// ✅ src/services/auth/authService.js
// ❌ src/components/Button/index.tsx (prohibited by prohibit-index rule set)
// ❌ src/utils/helpers/index.ts (prohibited by prohibit-index rule set)
// ❌ src/services/api/index.js (prohibited by prohibit-index rule set)
// ❌ src/components/modal/modal.jsx (violates pascal-case rule from standard-naming)
```

The `apply-and-continue` chaining ensures both rule sets are evaluated: first checking for prohibited index files, then applying standard naming conventions to all files (including those that pass the index check).

### Component File Must Match Folder Name

Ensure React components are organized with matching file and folder names:

```ts
{
  rules: [
    {
      // Component file must match its folder name
      match: "src/components/*/*.{jsx,tsx}",
      enforce: { files: "<dir>" }
    },
    {
      // Component folders must be PascalCase
      match: "src/components/*/**",
      enforce: { folder: "<pascal-case>" }
    },
    {
      // Style files must match component name
      match: "src/components/*/*.module.css",
      enforce: { files: "<dir>.module" }
    }
  ]
}

// Results:
// ✅ src/components/Button/Button.tsx
// ✅ src/components/UserProfile/UserProfile.jsx
// ✅ src/components/Button/Button.module.css
// ✅ src/components/Header/Header.module.css
// ❌ src/components/Button/index.tsx (must be Button.tsx)
// ❌ src/components/button/button.tsx (folder must be PascalCase)
// ❌ src/components/UserProfile/Profile.tsx (must be UserProfile.tsx)
// ❌ src/components/Button/styles.module.css (must be Button.module.css)
```

### React Hooks Naming

Enforce proper naming for React hooks:

```ts
{
  rules: [
    {
      // Custom hooks must start with 'use' and be camelCase
      match: "src/hooks/**/*.{js,ts}",
      enforce: { files: "use<pascal-case>" }
    },
    {
      // Hook files in component folders
      match: "src/components/*/hooks/*.{js,ts}",
      enforce: { files: "use<pascal-case>" }
    },
    {
      // Shared hooks with specific patterns
      match: "src/shared/hooks/**/*.{js,ts}",
      enforce: { 
        files: ["use<pascal-case>", "use<pascal-case>Hook"],
        folder: "<camel-case>"
      }
    }
  ]
}

// Results:
// ✅ src/hooks/useUserData.js
// ✅ src/hooks/useShoppingCart.ts
// ✅ src/components/Button/hooks/useButtonState.js
// ✅ src/shared/hooks/useAuthenticationHook.js
// ❌ src/hooks/UserData.js (missing 'use' prefix)
// ❌ src/hooks/use_shopping_cart.js (must be usePascalCase)
// ❌ src/hooks/use-shopping-cart.ts (must be usePascalCase)
// ❌ src/components/Button/hooks/buttonState.js (missing 'use' prefix)
```

### Test File Organization

Enforce consistent test file placement and naming:

```ts
{
  rules: [
    {
      // Test files must be in __tests__ folder
      match: "**/*.{test,spec}.{js,ts,jsx,tsx}",
      enforce: { folder: "**/__tests__" }
    },
    {
      // All files in __tests__ must be kebab-case and test files
      match: "**/__tests__/*",
      enforce: { files: "<kebab-case>.{test,spec}" }
    }
  ]
}

// Results:
// ✅ src/__tests__/button.test.js
// ✅ src/__tests__/utils.spec.ts
// ❌ src/__tests__/button.js (must have .test or .spec)
// ❌ src/__tests__/Button.test.js (must be kebab-case)
```

### Different Conventions by File Type

Apply different naming conventions based on file types:

```ts
{
  rules: [    
    // Regular TypeScript files in camelCase
    { 
      match: "**/*.ts", 
      enforce: { files: "<camel-case>" } 
    },
    
    // CSS modules with PascalCase
    { 
      match: "**/*.module.{css,scss}", 
      enforce: { files: "<pascal-case>.module" } 
    },
    
    // Test files maintain source file naming
    { 
      match: "**/*.{test,spec}.{js,ts}", 
      enforce: { files: "*.*" } 
    },
    
    // Storybook files
    {
      match: "**/*.stories.{js,jsx,ts,tsx}",
      enforce: { files: "<pascal-case>.stories" }
    },

    // Other React components in PascalCase
    { 
      match: {
        type: "all",
        patterns: [
          "**/*.{jsx,tsx}",
          // Exclude story files since they have their own rule
          "!**/*.stories.{jsx,tsx}" 
        ]
      }, 
      enforce: { files: "<pascal-case>" } 
    },
  ]
}

// Results:
// ✅ Button.jsx
// ✅ UserProfile.tsx
// ✅ userService.ts
// ✅ dataProcessor.ts
// ✅ Button.module.css
// ✅ Header.module.scss
// ✅ userService.test.js
// ✅ Button.stories.tsx
// ❌ button.jsx (must be PascalCase)
// ❌ UserService.ts (must be camelCase)
// ❌ button.module.css (must be PascalCase.module)
// ❌ button.stories.tsx (must be PascalCase.stories)
```

### Partial Path and Filename Matching

This recipe shows how to match files containing specific patterns anywhere in their path or filename. By default, patterns match the entire file path, but you can use wildcards (`*`, `**`) to match prefixes, suffixes, or partial patterns. See [Pattern Matching with Micromatch](#pattern-matching-with-micromatch)


```ts
{
  rules: [
    {
      // Match any file containing 'config' in the name
      match: "**/*config*",
      enforce: { files: ["<kebab-case>", "<kebab-case>.config"] }
    },
    {
      // Match files starting with 'test-'
      match: "**/test-*",
      enforce: { files: "test-<kebab-case>" }
    },
    {
      // Match files ending with '.utils'
      match: "**/*.utils.{js,ts}",
      enforce: { files: "<camel-case>.utils" }
    },
  ]
}

// Results:
// ✅ webpack.config.js (contains 'config', kebab-case)
// ✅ database-config.ts (contains 'config', kebab-case) 
// ✅ test-user-service.js (starts with 'test-')
// ✅ test-api-client.ts (starts with 'test-')
// ✅ stringUtils.utils.js (ends with '.utils', camelCase)
// ✅ dateFormatter.utils.ts (ends with '.utils', camelCase)
// ❌ Webpack-config.js (must be kebab-case)
// ❌ test-user_service.js (must be kebab-case after 'test-')
// ❌ StringUtils.utils.js (must be camelCase before '.utils')
```



### Monorepo Configuration

Configure different conventions for different packages using multiple rule sets:

```ts
export default [
  {
    plugins: {
      "naming-conventions": namingConventions,
    },
  },
  
  {
    rules: {
      "naming-conventions/enforce": [
        "error",
        // UI package - React components
        {
          id: "ui-package",
          scope: "packages/ui/**",
          rules: [
            { 
              match: "**/*.tsx", 
              enforce: { files: "<pascal-case>" } 
            },
            { 
              match: "**/hooks/*.ts", 
              enforce: { files: "use<pascal-case>" } 
            }
          ]
        },
        // API package - Services
        {
          id: "api-package", 
          scope: "packages/api/**",
          rules: [
            { 
              match: "**/*.service.ts", 
              enforce: { files: "<kebab-case>.service" } 
            },
            { 
              match: "**/*.controller.ts", 
              enforce: { files: "<kebab-case>.controller" } 
            }
          ]
        },
        // Shared utilities
        {
          id: "shared-package",
          scope: "packages/shared/**",
          rules: [
            {
              match: "**/*.ts",
              enforce: { files: "<camel-case>" }
            }
          ]
        }
      ]
    }
  }
];
```


### Handling Unmatched Files

By default, the plugin uses these settings for files that don't match any rules:
- `files: "error"` - Shows an error for unmatched files
- `folder: "<anything>"` - Allows any folder name

To override these defaults, configure the behavior in your ESLint settings:

```ts
export default [
  {
    plugins: {
      "naming-conventions": namingConventions,
    },
    settings: {
      "naming-conventions": {
        onUnmatched: {
          // Enforce kebab-case for all files which don't match any rule across all rule sets
          files: "<kebab-case>",
          
          // Enforce camel-case for all files which don't match any rule across all rule sets
          folder: "<camel-case>"
        }
      }
    }
  },
  {
    rules: {
      "naming-conventions/enforce": [
        "error",
        {
          rules: [
            // ... your rules
          ]
        }
      ]
    }
  }
];
```

## Debugging & Troubleshooting

When working with complex rules and rule sets, you can use the `id` property to identify which rule set is causing validation errors. The `id` will be included in ESLint error messages to help you debug configuration issues.

```ts
export default [
  {
    plugins: {
      "naming-conventions": namingConventions,
    },
  },
  {
    rules: {
      "naming-conventions/enforce": [
        "error",
        {
          id: "Next.js",
          scope: "src/apps/blog/**",
          rules: [
            {
              id: "App Router",
              match: "**/app/**/*",
              enforce: { 
                files: "<kebab-case>",
                folder: "<nextjs-app-router-folder>"
              }
            },
            {
              id: "Components",
              match: "**/components/**/*",
              enforce: { 
                files: "<pascal-case>", 
                folder: "<pascal-case>"
              }
            }
          ]
        },
      ]
    }
  }
];
```

## Acknowledgments

This project was inspired by and is based on [eslint-plugin-check-file][eslint-plugin-check-file] by [Huan Luo][huan-luo].

## License

This project is licensed under the Apache License 2.0. See [LICENSE][license] for details.

[license]: LICENSE
[huan-luo]: https://github.com/dukeluo
[micromatch]: https://github.com/micromatch/micromatch
[micromatch-capture]: https://github.com/micromatch/micromatch#capture
[glob-tester]: https://www.digitalocean.com/community/tools/glob
[eslint-plugin-check-file]: https://github.com/dukeluo/eslint-plugin-check-file
[eslint-flat-config]: https://eslint.org/docs/latest/use/configure/configuration-files
