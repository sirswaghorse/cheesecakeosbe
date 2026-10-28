use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use sysinfo::System;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "lowercase")]
enum KnownFolder {
    Documents,
    Pictures,
    Music,
    Videos,
    Downloads,
}

impl KnownFolder {
    fn path(&self) -> Option<PathBuf> {
        // Honor XDG user-dirs configuration, including localized folder names.
        match self {
            Self::Documents => dirs::document_dir(),
            Self::Pictures => dirs::picture_dir(),
            Self::Music => dirs::audio_dir(),
            Self::Videos => dirs::video_dir(),
            Self::Downloads => dirs::download_dir(),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SystemSummary {
    os: String,
    os_version: String,
    kernel: String,
    hostname: String,
    total_memory: u64,
    used_memory: u64,
}

fn require_linux() -> Result<(), String> {
    if cfg!(target_os = "linux") {
        Ok(())
    } else {
        Err("This bridge supports Linux only.".into())
    }
}

#[tauri::command]
async fn system_summary() -> Result<SystemSummary, String> {
    require_linux()?;
    tauri::async_runtime::spawn_blocking(|| {
        let mut system = System::new();
        system.refresh_memory();
        SystemSummary {
            os: System::name().unwrap_or_else(|| "Linux".into()),
            os_version: System::os_version().unwrap_or_else(|| "Unknown".into()),
            kernel: System::kernel_version().unwrap_or_else(|| "Unknown".into()),
            hostname: System::host_name().unwrap_or_else(|| "Unknown".into()),
            total_memory: system.total_memory(),
            used_memory: system.used_memory(),
        }
    })
    .await
    .map_err(|_| "Could not read system information.".into())
}

#[tauri::command]
async fn open_known_folder(folder: KnownFolder) -> Result<(), String> {
    require_linux()?;
    let path = folder.path().ok_or("This user folder is not configured in Linux.")?;
    if !path.is_absolute() {
        return Err("This user folder is not configured in Linux.".into());
    }
    tauri::async_runtime::spawn_blocking(move || {
        // Fresh live sessions may not have the XDG folders yet — create the
        // requested one instead of failing.
        if !path.is_dir() {
            std::fs::create_dir_all(&path)
                .map_err(|_| "Could not create this user folder.".to_string())?;
        }
        // One fixed executable, one absolute argument. Never execute a shell.
        let opened = Command::new("xdg-open")
            .arg(&path)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map(|s| s.success())
            .unwrap_or(false);
        if opened {
            return Ok(());
        }
        // xdg-open can fail in minimal sessions without a desktop portal;
        // fall back to the file manager shipped with Cheesecake OS.
        Command::new("thunar")
            .arg(&path)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map(|_| ())
            .map_err(|_| "Could not launch the system file manager.".to_string())
    })
    .await
    .map_err(|_| "The folder request failed.".to_string())?
}

/// Ends the Cheesecake desktop process. Inside the Openbox session the app is the
/// foreground process, so exiting returns the user to the login screen.
#[tauri::command]
fn exit_session(app: tauri::AppHandle) -> Result<(), String> {
    require_linux()?;
    app.exit(0);
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![system_summary, open_known_folder, exit_session])
        .run(tauri::generate_context!())
        .expect("failed to run Cheesecake OS");
}

#[cfg(test)]
mod tests {
    use super::KnownFolder;

    #[test]
    fn only_known_user_folders_are_accepted() {
        for name in ["documents", "pictures", "music", "videos", "downloads"] {
            assert!(serde_json::from_str::<KnownFolder>(&format!("\"{name}\"")).is_ok());
        }
        for input in ["\"/etc\"", "\"../Documents\"", "\"documents; shutdown\"", "\"terminal\""] {
            assert!(serde_json::from_str::<KnownFolder>(input).is_err());
        }
    }
}