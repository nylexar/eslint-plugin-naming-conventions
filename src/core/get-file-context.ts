import path from "node:path";
import type { RuleContext } from "@eslint/core";

/**
 * @example C:\
 */
const WINDOWS_DRIVE_LETTER_REGEXP = /^[A-Za-z]:\\/;

function toPosixPath(inputPath: string): string {
  return path
    .normalize(inputPath.replace(WINDOWS_DRIVE_LETTER_REGEXP, "/"))
    .split(path.sep)
    .join(path.posix.sep);
}

interface PathInfo {
  absolute: string;
  relative: string;
}

interface FileDetails {
  /**
   * @example component.tsx
   */
  base: string;

  /**
   * @example component
   */
  name: string;

  /**
   * @example 'tsx'
   */
  ext: string;

  path: PathInfo;
}

interface DirectoryDetails {
  name: string;
  base: string;
  path: PathInfo;
}

interface FileContext {
  cwd: string;
  file: FileDetails;
  dir: DirectoryDetails;
}

export type { FileContext, DirectoryDetails, FileDetails, PathInfo };

export function getFileContext(
  context: Pick<RuleContext, "cwd" | "physicalFilename">,
): FileContext {
  const cwd = toPosixPath(context.cwd);

  const absPath = toPosixPath(context.physicalFilename);
  const relativePath = path.posix.relative(cwd, absPath);

  const { name, ext, dir, base } = path.posix.parse(relativePath);

  const dirBaseName = path.posix.basename(dir);
  const dirName = (() => {
    return dir === "." || dir === ".." || dir.startsWith("../")
      ? ""
      : dirBaseName;
  })();

  return {
    cwd,

    file: {
      name,
      base,
      ext: ext.slice(1),
      path: {
        absolute: absPath,
        relative: relativePath,
      },
    },

    dir: {
      name: dirName,
      base: dirBaseName,
      path: {
        relative: dir,
        absolute: path.posix.dirname(absPath),
      },
    },
  };
}
