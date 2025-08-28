import { getFileContext } from "@/core/get-file-context";

describe("getFileContext", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("posix", () => {
    beforeEach(async () => {
      vi.resetModules();

      vi.mock("node:path", async () => {
        const posix = await vi
          .importActual<typeof import("node:path")>("node:path")
          .then((mod) => mod.posix);

        return {
          default: posix,
          ...posix,
        };
      });
    });

    test("basic file paths", () => {
      const context = {
        cwd: "/home/user/project",
        physicalFilename: "/home/user/project/src/components/Button.tsx",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "/home/user/project",
        file: {
          path: {
            absolute: "/home/user/project/src/components/Button.tsx",
            relative: "src/components/Button.tsx",
          },
          base: "Button.tsx",
          name: "Button",
          ext: "tsx",
        },
        dir: {
          name: "components",
          base: "components",
          path: {
            absolute: "/home/user/project/src/components",
            relative: "src/components",
          },
        },
      });
    });

    test("files in the same directory as cwd", () => {
      const context = {
        cwd: "/home/user/project",
        physicalFilename: "/home/user/project/index.js",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "/home/user/project",
        file: {
          path: {
            absolute: "/home/user/project/index.js",
            relative: "index.js",
          },
          base: "index.js",
          name: "index",
          ext: "js",
        },
        dir: {
          name: "",
          base: "",
          path: {
            absolute: "/home/user/project",
            relative: "",
          },
        },
      });
    });

    test("deeply nested file paths", () => {
      const context = {
        cwd: "/home/user/project",
        physicalFilename:
          "/home/user/project/src/components/organisms/Header/Header.test.tsx",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "/home/user/project",
        file: {
          name: "Header.test",
          ext: "tsx",
          base: "Header.test.tsx",
          path: {
            absolute:
              "/home/user/project/src/components/organisms/Header/Header.test.tsx",
            relative: "src/components/organisms/Header/Header.test.tsx",
          },
        },
        dir: {
          name: "Header",
          base: "Header",
          path: {
            absolute: "/home/user/project/src/components/organisms/Header",
            relative: "src/components/organisms/Header",
          },
        },
      });
    });

    test("paths with special characters", () => {
      const context = {
        cwd: "/home/user/my-project@2.0",
        physicalFilename: "/home/user/my-project@2.0/src/[id]/page.tsx",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "/home/user/my-project@2.0",
        file: {
          path: {
            absolute: "/home/user/my-project@2.0/src/[id]/page.tsx",
            relative: "src/[id]/page.tsx",
          },
          base: "page.tsx",
          name: "page",
          ext: "tsx",
        },
        dir: {
          name: "[id]",
          base: "[id]",
          path: {
            absolute: "/home/user/my-project@2.0/src/[id]",
            relative: "src/[id]",
          },
        },
      });
    });

    test("root directory paths", () => {
      const context = {
        cwd: "/",
        physicalFilename: "/app.js",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "/",
        file: {
          path: {
            absolute: "/app.js",
            relative: "app.js",
          },
          base: "app.js",
          name: "app",
          ext: "js",
        },
        dir: {
          name: "",
          base: "",
          path: {
            absolute: "/",
            relative: "",
          },
        },
      });
    });

    test("files without extensions", () => {
      const context = {
        cwd: "/home/user/project",
        physicalFilename: "/home/user/project/Dockerfile",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "/home/user/project",
        file: {
          path: {
            absolute: "/home/user/project/Dockerfile",
            relative: "Dockerfile",
          },
          base: "Dockerfile",
          name: "Dockerfile",
          ext: "",
        },
        dir: {
          name: "",
          base: "",
          path: {
            absolute: "/home/user/project",
            relative: "",
          },
        },
      });
    });

    test("dotfiles", () => {
      const context = {
        cwd: "/home/user/project",
        physicalFilename: "/home/user/project/.eslintrc.js",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "/home/user/project",
        file: {
          path: {
            absolute: "/home/user/project/.eslintrc.js",
            relative: ".eslintrc.js",
          },
          base: ".eslintrc.js",
          name: ".eslintrc",
          ext: "js",
        },
        dir: {
          name: "",
          base: "",
          path: {
            absolute: "/home/user/project",
            relative: "",
          },
        },
      });
    });

    test("paths with multiple dots", () => {
      const context = {
        cwd: "/home/user/project",
        physicalFilename: "/home/user/project/src/utils.test.spec.ts",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "/home/user/project",
        file: {
          path: {
            absolute: "/home/user/project/src/utils.test.spec.ts",
            relative: "src/utils.test.spec.ts",
          },
          base: "utils.test.spec.ts",
          name: "utils.test.spec",
          ext: "ts",
        },
        dir: {
          name: "src",
          base: "src",
          path: {
            absolute: "/home/user/project/src",
            relative: "src",
          },
        },
      });
    });

    test("trailing slashes in cwd", () => {
      const context = {
        cwd: "/home/user/project/",
        physicalFilename: "/home/user/project/src/index.js",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "/home/user/project/",
        file: {
          path: {
            absolute: "/home/user/project/src/index.js",
            relative: "src/index.js",
          },
          base: "index.js",
          name: "index",
          ext: "js",
        },
        dir: {
          name: "src",
          base: "src",
          path: {
            absolute: "/home/user/project/src",
            relative: "src",
          },
        },
      });
    });

    test("files in parent directories", () => {
      const context = {
        cwd: "/home/user/project/src",
        physicalFilename: "/home/user/project/package.json",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "/home/user/project/src",
        file: {
          path: {
            absolute: "/home/user/project/package.json",
            relative: "../package.json",
          },
          base: "package.json",
          name: "package",
          ext: "json",
        },
        dir: {
          name: "",
          base: "..",
          path: {
            absolute: "/home/user/project",
            relative: "..",
          },
        },
      });
    });

    test("files in sibling directories", () => {
      const context = {
        cwd: "/home/user/project/src/components",
        physicalFilename: "/home/user/project/src/utils/helpers.js",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "/home/user/project/src/components",
        file: {
          path: {
            absolute: "/home/user/project/src/utils/helpers.js",
            relative: "../utils/helpers.js",
          },
          base: "helpers.js",
          name: "helpers",
          ext: "js",
        },
        dir: {
          name: "",
          base: "utils",
          path: {
            absolute: "/home/user/project/src/utils",
            relative: "../utils",
          },
        },
      });
    });

    test("files with no directory structure", () => {
      const context = {
        cwd: "/home/user/project/src",
        physicalFilename: "/home/user/project/src/package.json",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "/home/user/project/src",
        file: {
          path: {
            absolute: "/home/user/project/src/package.json",
            relative: "package.json",
          },
          base: "package.json",
          name: "package",
          ext: "json",
        },
        dir: {
          name: "",
          base: "",
          path: {
            absolute: "/home/user/project/src",
            relative: "",
          },
        },
      });
    });

    test("relative paths that go up multiple directories", () => {
      const context = {
        cwd: "/home/user/project/src/components/atoms",
        physicalFilename: "/home/user/config/eslint.config.js",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "/home/user/project/src/components/atoms",
        file: {
          path: {
            absolute: "/home/user/config/eslint.config.js",
            relative: "../../../../config/eslint.config.js",
          },
          base: "eslint.config.js",
          name: "eslint.config",
          ext: "js",
        },
        dir: {
          name: "",
          base: "config",
          path: {
            absolute: "/home/user/config",
            relative: "../../../../config",
          },
        },
      });
    });
  });

  describe("windows", () => {
    beforeEach(async () => {
      vi.resetModules();

      vi.mock("node:path", async () => {
        const win32 = await vi
          .importActual<typeof import("node:path")>("node:path")
          .then((mod) => mod.win32);

        return {
          default: win32,
          ...win32,
        };
      });
    });

    test("Windows paths with drive letters", () => {
      const context = {
        cwd: "C:\\Users\\Developer\\project",
        physicalFilename: "C:\\Users\\Developer\\project\\src\\index.js",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "/Users/Developer/project",
        file: {
          path: {
            absolute: "/Users/Developer/project/src/index.js",
            relative: "src/index.js",
          },
          base: "index.js",
          name: "index",
          ext: "js",
        },
        dir: {
          name: "src",
          base: "src",
          path: {
            absolute: "/Users/Developer/project/src",
            relative: "src",
          },
        },
      });
    });

    test("mixed path separators on Windows", () => {
      const context = {
        cwd: "D:\\Projects/my-app\\src",
        physicalFilename: "D:\\Projects\\my-app/src\\utils/helpers.js",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "/Projects/my-app/src",
        file: {
          path: {
            absolute: "/Projects/my-app/src/utils/helpers.js",
            relative: "utils/helpers.js",
          },
          base: "helpers.js",
          name: "helpers",
          ext: "js",
        },
        dir: {
          name: "utils",
          base: "utils",
          path: {
            absolute: "/Projects/my-app/src/utils",
            relative: "utils",
          },
        },
      });
    });

    test("Windows UNC paths", () => {
      const context = {
        cwd: "\\\\server\\share\\project",
        physicalFilename: "\\\\server\\share\\project\\src\\index.js",
      };

      const result = getFileContext(context);

      expect(result).toEqual({
        cwd: "//server/share/project",
        file: {
          path: {
            absolute: "//server/share/project/src/index.js",
            relative: "src/index.js",
          },
          base: "index.js",
          name: "index",
          ext: "js",
        },
        dir: {
          name: "src",
          base: "src",
          path: {
            absolute: "//server/share/project/src",
            relative: "src",
          },
        },
      });
    });
  });
});
