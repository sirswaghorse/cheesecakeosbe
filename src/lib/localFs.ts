import { useCallback, useEffect, useState } from "react";

/** On-device file storage (IndexedDB). Files never leave this browser. */
export interface LocalFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  blob: Blob;
}

const DB_NAME = "cheesecake-fs";
const STORE = "files";
const EVENT = "cheesecake-fs-change";
/** Simulated virtual disk size shown in Computer. */
export const VIRTUAL_DISK_SIZE = 20 * 1024 * 1024 * 1024;

let dbPromise: Promise<IDBDatabase> | null = null;
const openDb = () => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => { dbPromise = null; reject(req.error); };
    });
  }
  return dbPromise;
};

const tx = async <T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

const notify = () => window.dispatchEvent(new Event(EVENT));

export const listFiles = async (): Promise<LocalFile[]> => {
  const all = await tx<LocalFile[]>("readonly", (s) => s.getAll());
  return all.sort((a, b) => b.created_at.localeCompare(a.created_at));
};

export const addFile = async (file: File) => {
  const rec: LocalFile = {
    id: crypto.randomUUID(),
    file_name: file.name,
    file_type: file.type || "application/octet-stream",
    file_size: file.size,
    created_at: new Date().toISOString(),
    blob: file,
  };
  await tx("readwrite", (s) => s.put(rec));
  notify();
  return rec;
};

export const deleteFile = async (id: string) => {
  await tx("readwrite", (s) => s.delete(id));
  notify();
};

export const renameFile = async (id: string, name: string) => {
  const rec = await tx<LocalFile | undefined>("readonly", (s) => s.get(id));
  if (!rec || !name.trim()) return;
  await tx("readwrite", (s) => s.put({ ...rec, file_name: name.trim() }));
  notify();
};

/** Live list of local files, optionally filtered by MIME prefix (e.g. "image/"). */
export const useLocalFiles = (typePrefix?: string) => {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      const all = await listFiles();
      setFiles(typePrefix ? all.filter((f) => f.file_type.startsWith(typePrefix)) : all);
    } finally { setLoading(false); }
  }, [typePrefix]);
  useEffect(() => {
    refresh();
    window.addEventListener(EVENT, refresh);
    return () => window.removeEventListener(EVENT, refresh);
  }, [refresh]);
  return { files, loading, refresh };
};

/** Object URLs keyed by file id, revoked when files change or on unmount. */
export const useObjectUrls = (files: LocalFile[]) => {
  const [urls, setUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    const map: Record<string, string> = {};
    files.forEach((f) => { map[f.id] = URL.createObjectURL(f.blob); });
    setUrls(map);
    return () => Object.values(map).forEach((u) => URL.revokeObjectURL(u));
  }, [files]);
  return urls;
};
