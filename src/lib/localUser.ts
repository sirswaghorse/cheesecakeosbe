import { useEffect, useState } from "react";

export interface LocalUser {
  username: string;
  displayName: string;
}

const KEY = "cheesecake_local_user";
const EVENT = "cheesecake-user-change";
export const DEFAULT_LOCAL_USER: LocalUser = { username: "cheesecake", displayName: "Cheesecake User" };

/** Linux-style username: lowercase letters, digits, - and _, max 32 chars, starts with a letter. */
export const sanitizeUsername = (raw: string): string => {
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9_-]/g, "").replace(/^[^a-z]+/, "").slice(0, 32);
  return cleaned || DEFAULT_LOCAL_USER.username;
};

export const getLocalUser = (): LocalUser => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "null");
    if (parsed && typeof parsed.username === "string") {
      return {
        username: sanitizeUsername(parsed.username),
        displayName: String(parsed.displayName || "").trim().slice(0, 60) || DEFAULT_LOCAL_USER.displayName,
      };
    }
  } catch { /* fall through */ }
  return DEFAULT_LOCAL_USER;
};

export const setLocalUser = (next: Partial<LocalUser>) => {
  const cur = getLocalUser();
  const merged: LocalUser = {
    username: next.username !== undefined ? sanitizeUsername(next.username) : cur.username,
    displayName: next.displayName !== undefined ? next.displayName.trim().slice(0, 60) || DEFAULT_LOCAL_USER.displayName : cur.displayName,
  };
  localStorage.setItem(KEY, JSON.stringify(merged));
  window.dispatchEvent(new Event(EVENT));
  return merged;
};

export const useLocalUser = () => {
  const [user, setUser] = useState<LocalUser>(getLocalUser);
  useEffect(() => {
    const h = () => setUser(getLocalUser());
    window.addEventListener(EVENT, h);
    window.addEventListener("storage", h);
    return () => { window.removeEventListener(EVENT, h); window.removeEventListener("storage", h); };
  }, []);
  return user;
};
