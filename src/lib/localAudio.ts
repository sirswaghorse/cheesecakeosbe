import { listFiles, type LocalFile } from "@/lib/localFs";

/** URLs belong to the player session, never to cloud storage. */
export function createLocalAudioPlaylist(files: LocalFile[]) {
  const urls: string[] = [];
  try {
    const tracks = files.filter((file) => file.file_type.startsWith("audio/")).map((file) => {
      const url = URL.createObjectURL(file.blob);
      urls.push(url);
      return { url, metaData: { artist: "My Music", title: file.file_name } };
    });
    return {
      tracks,
      dispose: () => urls.splice(0).forEach((url) => URL.revokeObjectURL(url)),
    };
  } catch (error) {
    urls.forEach((url) => URL.revokeObjectURL(url));
    throw error;
  }
}

export async function loadLocalAudioPlaylist() {
  return createLocalAudioPlaylist(await listFiles());
}