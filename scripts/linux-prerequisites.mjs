import { spawnSync } from "node:child_process";

export const MINIMUM_RUST = [1, 90, 0];
export const REQUIRED_LIBRARIES = ["gtk+-3.0", "webkit2gtk-4.1", "dbus-1", "openssl", "librsvg-2.0"];

export function rustIsSupported(output) {
  const match = /^rustc (\d+)\.(\d+)\.(\d+)/.exec(output.trim());
  if (!match) return false;
  const version = match.slice(1).map(Number);
  for (let i = 0; i < MINIMUM_RUST.length; i += 1) {
    if (version[i] !== MINIMUM_RUST[i]) return version[i] > MINIMUM_RUST[i];
  }
  return true;
}

export function checkLinuxPrerequisites({ interactive = false } = {}) {
  const problems = [];
  if (process.platform !== "linux") problems.push("Use a Linux machine for this native host.");
  const rust = spawnSync("rustc", ["--version"], { encoding: "utf8" });
  if (rust.status !== 0 || !rustIsSupported(rust.stdout || "")) problems.push("Install Rust 1.90 or newer (required by the locked Tauri version).");
  for (const tool of ["cargo", "bun", "pkg-config", "cc"]) {
    if (spawnSync(tool, ["--version"], { stdio: "ignore" }).status !== 0) problems.push(`Install ${tool}.`);
  }
  for (const library of REQUIRED_LIBRARIES) {
    if (spawnSync("pkg-config", ["--exists", library], { stdio: "ignore" }).status !== 0) problems.push(`Install development libraries for ${library}.`);
  }
  if (interactive) {
    if (!process.env.DISPLAY && !process.env.WAYLAND_DISPLAY) problems.push("Start from a Linux desktop session (X11 or Wayland).");
    if (spawnSync("xdg-open", ["--version"], { stdio: "ignore" }).status !== 0) problems.push("Install xdg-utils and a default file manager.");
  }
  return problems;
}