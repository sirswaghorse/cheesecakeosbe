import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const iso = resolve(__dirname, "../../linux/iso");
const read = (f: string) => readFileSync(resolve(iso, f), "utf8");

describe("Linux ISO recipe", () => {
  it("live image auto-logs into the Cheesecake session", () => {
    const conf = read("config/includes.chroot/etc/lightdm/lightdm.conf.d/50-cheesecake.conf");
    expect(conf).toMatch(/^autologin-session=cheesecake-os$/m);
    expect(conf).toMatch(/^user-session=cheesecake-os$/m);
  });

  it("image includes the desktop runtime and installer", () => {
    const list = read("config/package-lists/cheesecake.list.chroot");
    for (const p of ["openbox", "lightdm", "libwebkit2gtk-4.1-0", "calamares"]) expect(list).toMatch(new RegExp(`^${p}$`, "m"));
  });

  it("build script ships the session files and the app package", () => {
    const s = read("build-iso.sh");
    expect(s).toContain("linux/session/cheesecake-session");
    expect(s).toContain("packages.chroot");
    expect(() => execFileSync("sh", ["-n", resolve(iso, "build-iso.sh")])).not.toThrow();
    expect(() => execFileSync("sh", ["-n", resolve(iso, "config/hooks/normal/0500-cheesecake-session.hook.chroot")])).not.toThrow();
  });
});
