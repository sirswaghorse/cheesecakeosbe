fn main() {
    let manifest = tauri_build::AppManifest::new()
        .commands(&["system_summary", "open_known_folder", "exit_session"]);
    tauri_build::try_build(tauri_build::Attributes::new().app_manifest(manifest))
        .expect("failed to build Tauri permissions");
}