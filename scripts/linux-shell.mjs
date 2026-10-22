import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { checkLinuxPrerequisites } from "./linux-prerequisites.mjs";

const commands = {
  dev: ["tauri", "dev", "--", "--locked"],
  compile: ["tauri", "build", "--no-bundle", "--", "--locked"],
  build: ["tauri", "build", "--", "--locked"],
  deb: ["tauri", "build", "--bundles", "deb", "--", "--locked"],
  appimage: ["tauri", "build", "--bundles", "appimage", "--", "--locked"],
};
const mode = process.argv[2] || "doctor";
if (mode !== "doctor" && mode !== "test" && !Object.hasOwn(commands, mode)) {
  console.error("Choose doctor, dev, compile, build, deb, appimage or test.");
  process.exit(2);
}
const problems = checkLinuxPrerequisites({ interactive: mode === "dev" });
if (problems.length) {
  console.error("Cheesecake OS Linux prerequisites are incomplete:\n" + problems.map(problem => `- ${problem}`).join("\n"));
  console.error("See docs/linux-bridge.md for installation instructions. No packages were installed or builds started.");
  process.exit(1);
}
console.log("Linux compile prerequisites passed.");
if (mode === "doctor") process.exit(0);
const root = fileURLToPath(new URL("../", import.meta.url));
const result = mode === "test"
  ? spawnSync("cargo", ["test", "--locked", "--manifest-path", "src-tauri/Cargo.toml"], { cwd: root, stdio: "inherit" })
  : spawnSync("bun", ["x", ...commands[mode]], { cwd: root, stdio: "inherit" });
if (result.error) console.error("Could not start the Linux command:", result.error.message);
process.exit(result.status ?? 1);