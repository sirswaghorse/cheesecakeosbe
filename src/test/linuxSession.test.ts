import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const dir = resolve(__dirname, "../../linux/session");
const read = (f: string) => readFileSync(resolve(dir, f), "utf8");
const cargo = readFileSync(resolve(__dirname, "../../src-tauri/Cargo.toml"), "utf8");
const binName = /^name = "([^"]+)"/m.exec(cargo)![1];

describe("Linux session files", () => {
  it("login-screen entry launches the session and requires the installed app", () => {
    const entry = read("cheesecake-os.desktop");
    expect(entry).toMatch(/^Type=XSession$/m);
    expect(entry).toMatch(/^Exec=\/usr\/bin\/cheesecake-session$/m);
    expect(entry).toContain(`TryExec=/usr/bin/${binName}`);
  });

  it("session launcher targets the packaged binary and never uses sudo or broad kills", () => {
    const s = read("cheesecake-session");
    expect(s).toContain(`/usr/bin/${binName}`);
    expect(s).not.toMatch(/\bsudo\b|pkill|killall/);
  });

  it("Openbox removes window chrome for the Cheesecake window", () => {
    const rc = read("openbox-rc.xml");
    expect(rc).toContain(`class="${binName}"`);
    expect(rc).toMatch(/<decor>no<\/decor>/);
    expect(rc).toMatch(/<fullscreen>yes<\/fullscreen>/);
  });

  it("shell scripts have valid syntax", () => {
    for (const f of ["cheesecake-session", "xinitrc.cheesecake"]) {
      expect(() => execFileSync("sh", ["-n", resolve(dir, f)])).not.toThrow();
    }
  });
});
