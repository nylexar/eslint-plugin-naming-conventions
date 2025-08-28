import { execSync } from "child_process";
import { relative } from "path";

const dirs = execSync("pnpm list --recursive --depth -1 --parseable", {
  encoding: "utf-8",
})
  .trim()
  .split("\n")
  .filter(Boolean);

let failed = false;

for (const dir of dirs) {
  const relativePath = relative(process.cwd(), dir);
  console.log(
    `\n📦 ${relativePath === "" ? "(root)" : relativePath}\n${"─".repeat(30)}`,
  );

  try {
    execSync(`depcheck --ignores="depcheck" "${dir}"`, { stdio: "inherit" });
    console.log("✅\n");
  } catch {
    console.error("❌\n");
    failed = true;
  }
}

if (failed) {
  throw new Error("depcheck failed for one or more packages");
}
