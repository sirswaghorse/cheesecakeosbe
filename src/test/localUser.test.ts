import { describe, it, expect, beforeEach } from "vitest";
import { sanitizeUsername, getLocalUser, setLocalUser, DEFAULT_LOCAL_USER } from "@/lib/localUser";

describe("local user account", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to the cheesecake local user without signing in", () => {
    expect(getLocalUser()).toEqual({ username: "cheesecake", displayName: "Cheesecake User" });
  });

  it("makes usernames Linux-style", () => {
    expect(sanitizeUsername("Jonah The Good!")).toBe("jonahthegood");
    expect(sanitizeUsername("123abc")).toBe("abc");
    expect(sanitizeUsername("!!!")).toBe(DEFAULT_LOCAL_USER.username);
  });

  it("saves the profile on this device", () => {
    setLocalUser({ username: "Jonah", displayName: "Jonah" });
    expect(getLocalUser()).toEqual({ username: "jonah", displayName: "Jonah" });
  });
});
