import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LocalFile } from "@/lib/localFs";
import { createLocalAudioPlaylist, loadLocalAudioPlaylist } from "@/lib/localAudio";

vi.mock("@/lib/localFs", () => ({ listFiles: vi.fn() }));
import { listFiles } from "@/lib/localFs";

const file = (name: string, type: string): LocalFile => ({
  id: name, file_name: name, file_type: type, file_size: 3,
  created_at: "2026-10-22T06:48:00Z", blob: new Blob(["abc"], { type }),
});

describe("local music playlists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn().mockReturnValue("blob:local-song") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  });

  it("loads only on-device audio, without a cloud account", async () => {
    const song = file("Saved music.wav", "audio/wav");
    vi.mocked(listFiles).mockResolvedValue([song, file("Photo.png", "image/png"), file("Movie.mp4", "video/mp4")]);
    const playlist = await loadLocalAudioPlaylist();
    expect(listFiles).toHaveBeenCalledExactlyOnceWith();
    expect(URL.createObjectURL).toHaveBeenCalledExactlyOnceWith(song.blob);
    expect(playlist.tracks).toEqual([{ url: "blob:local-song", metaData: { artist: "My Music", title: "Saved music.wav" } }]);
  });

  it("keeps an empty music library empty instead of loading a remote sample", () => {
    expect(createLocalAudioPlaylist([]).tracks).toEqual([]);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("releases each URL once when the player session ends", () => {
    const playlist = createLocalAudioPlaylist([file("Song.wav", "audio/wav")]);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    playlist.dispose();
    playlist.dispose();
    expect(URL.revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:local-song");
  });

  it("releases earlier URLs if creating a playlist fails", () => {
    vi.mocked(URL.createObjectURL).mockReturnValueOnce("blob:first").mockImplementationOnce(() => { throw new Error("failure"); });
    expect(() => createLocalAudioPlaylist([file("One.wav", "audio/wav"), file("Two.wav", "audio/wav")])).toThrow("failure");
    expect(URL.revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:first");
  });
});