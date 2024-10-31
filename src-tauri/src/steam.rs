use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::fs;
use tauri::{AppHandle, Manager, Listener, Emitter};
use serde::{Deserialize, Serialize};
use crate::db;
use std::io::{BufRead, BufReader, Write};
use std::sync::{Arc, Mutex};

#[derive(Debug, Deserialize, Serialize)]
pub struct SteamCredentials {
    pub username: String,
    pub password: String,
    pub two_factor_code: Option<String>,
}

// Helper macro for development logging
macro_rules! dev_log {
    ($($arg:tt)*) => {
        #[cfg(debug_assertions)]
        println!("[SteamCMD] {}", format!($($arg)*));
    }
}

// Helper function to get SteamCMD directory in the app's directory
pub(crate) fn get_steamcmd_dir(_app: &AppHandle) -> Result<PathBuf, String> {
    let exe_path = std::env::current_exe()
        .map_err(|e| format!("Failed to get executable path: {}", e))?;
    
    let app_dir = exe_path
        .parent()
        .ok_or_else(|| "Failed to get parent directory".to_string())?;
    
    Ok(app_dir.join("steamcmd"))
}

pub(crate) fn is_steamcmd_installed(app: &AppHandle) -> Result<bool, String> {
    let steamcmd_dir = get_steamcmd_dir(app)?;
    #[cfg(target_os = "windows")]
    {
        let path = steamcmd_dir.join("steamcmd.exe");
        let exists = path.exists();
        dev_log!("Checking Windows path: {:?} (exists: {})", path, exists);
        Ok(exists)
    }
    #[cfg(not(target_os = "windows"))]
    {
        let path = steamcmd_dir.join("steamcmd.sh");
        let exists = path.exists();
        dev_log!("Checking Unix path: {:?} (exists: {})", path, exists);
        Ok(exists)
    }
}

pub(crate) fn install_steamcmd(app: &AppHandle) -> Result<(), String> {
    let steamcmd_dir = get_steamcmd_dir(app)?;
    fs::create_dir_all(&steamcmd_dir)
        .map_err(|e| format!("Failed to create SteamCMD directory: {}", e))?;

    #[cfg(target_os = "windows")]
    {
        dev_log!("Starting Windows installation process");
        let zip_path = steamcmd_dir.join("steamcmd.zip");

        dev_log!("Downloading steamcmd.zip...");
        let output = Command::new("powershell")
            .args(&[
                "-Command",
                &format!(
                    "Invoke-WebRequest -Uri 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip' -OutFile '{}'",
                    zip_path.to_string_lossy()
                )
            ])
            .output()
            .map_err(|e| format!("Failed to download SteamCMD: {}", e))?;

        if !output.status.success() {
            dev_log!("Download failed with stderr: {}", String::from_utf8_lossy(&output.stderr));
            return Err("Failed to download SteamCMD".to_string());
        }
        dev_log!("Download completed successfully");

        dev_log!("Extracting steamcmd.zip...");
        let output = Command::new("powershell")
            .args(&[
                "-Command",
                &format!(
                    "Expand-Archive -Path '{}' -DestinationPath '{}' -Force",
                    zip_path.to_string_lossy(),
                    steamcmd_dir.to_string_lossy()
                )
            ])
            .output()
            .map_err(|e| format!("Failed to extract SteamCMD: {}", e))?;

        if !output.status.success() {
            dev_log!("Extraction failed with stderr: {}", String::from_utf8_lossy(&output.stderr));
            return Err("Failed to extract SteamCMD".to_string());
        }
        dev_log!("Extraction completed successfully");

        // Clean up zip file
        let _ = fs::remove_file(zip_path);
    }

    #[cfg(target_os = "linux")]
    {
        dev_log!("Starting Linux installation process");
        let tar_path = steamcmd_dir.join("steamcmd_linux.tar.gz");

        dev_log!("Downloading steamcmd_linux.tar.gz...");
        let output = Command::new("curl")
            .args(&[
                "-o",
                tar_path.to_str().unwrap(),
                "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz",
            ])
            .output()
            .map_err(|e| format!("Failed to download SteamCMD: {}", e))?;

        if !output.status.success() {
            return Err("Failed to download SteamCMD".to_string());
        }

        dev_log!("Extracting steamcmd_linux.tar.gz...");
        let output = Command::new("tar")
            .current_dir(&steamcmd_dir)
            .args(&["-xzf", tar_path.to_str().unwrap()])
            .output()
            .map_err(|e| format!("Failed to extract SteamCMD: {}", e))?;

        if !output.status.success() {
            return Err("Failed to extract SteamCMD".to_string());
        }

        // Clean up tar.gz file
        let _ = fs::remove_file(tar_path);
    }

    #[cfg(target_os = "macos")]
    {
        dev_log!("Starting macOS installation process");
        let tar_path = steamcmd_dir.join("steamcmd_osx.tar.gz");

        dev_log!("Downloading steamcmd_osx.tar.gz...");
        let output = Command::new("curl")
            .args(&[
                "-o",
                tar_path.to_str().unwrap(),
                "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz",
            ])
            .output()
            .map_err(|e| format!("Failed to download SteamCMD: {}", e))?;

        if !output.status.success() {
            return Err("Failed to download SteamCMD".to_string());
        }

        dev_log!("Extracting steamcmd_osx.tar.gz...");
        let output = Command::new("tar")
            .current_dir(&steamcmd_dir)
            .args(&["-xzf", tar_path.to_str().unwrap()])
            .output()
            .map_err(|e| format!("Failed to extract SteamCMD: {}", e))?;

        if !output.status.success() {
            return Err("Failed to extract SteamCMD".to_string());
        }

        // Make steamcmd.sh executable
        let output = Command::new("chmod")
            .args(&["+x", steamcmd_dir.join("steamcmd.sh").to_str().unwrap()])
            .output()
            .map_err(|e| format!("Failed to make steamcmd.sh executable: {}", e))?;

        if !output.status.success() {
            return Err("Failed to make steamcmd.sh executable".to_string());
        }

        // Clean up tar.gz file
        let _ = fs::remove_file(tar_path);
    }

    dev_log!("Installation process completed successfully");
    Ok(())
}

pub(crate) async fn ensure_steamcmd(app: AppHandle) -> Result<String, String> {
    dev_log!("Checking if SteamCMD is installed...");
    if is_steamcmd_installed(&app)? {
        dev_log!("SteamCMD is already installed");
        return Ok("SteamCMD is already installed".to_string());
    }

    dev_log!("SteamCMD not found, starting installation...");
    install_steamcmd(&app).map_err(|e| e.to_string())?;
    Ok("SteamCMD has been installed successfully".to_string())
}

pub(crate) async fn update_game(app: AppHandle, app_id: u32) -> Result<String, String> {
    let steamcmd_dir = get_steamcmd_dir(&app)?;
    
    let steamcmd_path = {
        #[cfg(target_os = "windows")]
        {
            steamcmd_dir.join("steamcmd.exe")
        }
        #[cfg(not(target_os = "windows"))]
        {
            let path = steamcmd_dir.join("steamcmd.sh");
            
            // Ensure the file is executable
            let output = Command::new("chmod")
                .args(&["+x", path.to_str().unwrap()])
                .output()
                .map_err(|e| format!("Failed to make steamcmd executable: {}", e))?;

            if !output.status.success() {
                return Err("Failed to make steamcmd executable".to_string());
            }
            
            path
        }
    };

    if !steamcmd_path.exists() {
        return Err(format!("SteamCMD not found at {:?}", steamcmd_path));
    }

    dev_log!("Starting update for app_id: {}", app_id);
    dev_log!("Using SteamCMD at: {:?}", steamcmd_path);
    
    let output = Command::new(&steamcmd_path)
        .current_dir(&steamcmd_dir)
        .args(&[
            "+login", "anonymous",
            "+app_update", &app_id.to_string(),
            "validate",
            "+quit"
        ])
        .output()
        .map_err(|e| format!("Failed to execute SteamCMD: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    dev_log!("SteamCMD stdout:\n{}", stdout);
    if !stderr.is_empty() {
        dev_log!("SteamCMD stderr:\n{}", stderr);
    }

    if !output.status.success() {
        if stdout.contains("Invalid Platform") {
            return Err("This game is not available for your platform".to_string());
        }
        if stdout.contains("No subscription") {
            return Err("You don't have access to this game".to_string());
        }
        if stdout.contains("FAILED") {
            return Err(format!(
                "Update failed. Please check the game ID and try again.\nError: {}",
                if stderr.is_empty() { &stdout } else { &stderr }
            ));
        }

        return Err(format!(
            "SteamCMD failed with unknown error.\nOutput: {}\nError: {}", 
            stdout, 
            stderr
        ));
    }

    if stdout.contains("Success!") || stdout.contains("fully installed") {
        dev_log!("Update completed successfully");
        Ok(format!("Successfully updated app {}", app_id))
    } else {
        dev_log!("Update completed but success message not found");
        Ok(format!("Update process completed for app {}, but please verify the installation", app_id))
    }
}

pub(crate) async fn update_game_authenticated(
    app: AppHandle,
    app_id: u32,
    credentials: SteamCredentials
) -> Result<String, String> {
    let steamcmd_dir = get_steamcmd_dir(&app)?;
    
    let steamcmd_path = {
        #[cfg(target_os = "windows")]
        {
            steamcmd_dir.join("steamcmd.exe")
        }
        #[cfg(not(target_os = "windows"))]
        {
            let path = steamcmd_dir.join("steamcmd.sh");
            
            // Ensure the file is executable
            let output = Command::new("chmod")
                .args(&["+x", path.to_str().unwrap()])
                .output()
                .map_err(|e| format!("Failed to make steamcmd executable: {}", e))?;

            if !output.status.success() {
                return Err("Failed to make steamcmd executable".to_string());
            }
            
            path
        }
    };

    if !steamcmd_path.exists() {
        return Err(format!("SteamCMD not found at {:?}", steamcmd_path));
    }

    dev_log!("Starting authenticated update for app_id: {}", app_id);
    
    let mut child = Command::new(&steamcmd_path)
        .current_dir(&steamcmd_dir)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start SteamCMD: {}", e))?;

    let stdout = child.stdout.take()
        .ok_or_else(|| "Failed to capture stdout".to_string())?;
    let stdin = child.stdin.take()
        .ok_or_else(|| "Failed to capture stdin".to_string())?;
    
    // Wrap stdin in Arc<Mutex>
    let stdin = Arc::new(Mutex::new(stdin));
    let stdin_clone = stdin.clone();
    
    let reader = BufReader::new(stdout);
    let app_handle = app.clone();

    // Create a channel for 2FA code communication
    let (tx, rx) = std::sync::mpsc::channel::<String>();

    // Get the main window
    let window = app_handle.get_webview_window("main")
        .ok_or_else(|| "Failed to get main window".to_string())?;

    // Set up event listener
    let tx_clone = tx.clone();
    window.listen("submit-2fa-code", move |event| {
        let payload = event.payload();
        let _ = tx_clone.send(payload.to_string());
    });

    // Spawn a thread to read stdout
    std::thread::spawn(move || {
        for line in reader.lines() {
            if let Ok(line) = line {
                dev_log!("SteamCMD: {}", line);
                let line_clone = line.clone(); // Clone the line for later use
                
                // Emit progress updates
                if line.contains("Update state") || line.contains("Progress:") {
                    if let Err(e) = window.emit("steam-update-progress", line) {
                        dev_log!("Failed to emit progress event: {}", e);
                    }
                }
                
                // Check for 2FA prompt
                if line_clone.contains("Two factor code:") {
                    if let Err(e) = window.emit("steam-2fa-required", ()) {
                        dev_log!("Failed to emit 2FA event: {}", e);
                    }
                    
                    // Wait for 2FA code from frontend
                    if let Ok(code) = rx.recv() {
                        if let Ok(mut stdin) = stdin_clone.lock() {
                            if let Err(e) = writeln!(&mut stdin, "{}", code) {
                                dev_log!("Failed to send 2FA code: {}", e);
                            }
                        }
                    }
                }
                
                // Check for success/failure conditions
                if line_clone.contains("Success!") || line_clone.contains("fully installed") {
                    if let Err(e) = window.emit("steam-update-success", app_id.to_string()) {
                        dev_log!("Failed to emit success event: {}", e);
                    }
                }
                
                if line_clone.contains("FAILED") || line_clone.contains("ERROR") {
                    if let Err(e) = window.emit("steam-update-error", line_clone) {
                        dev_log!("Failed to emit error event: {}", e);
                    }
                }
            }
        }
    });

    // Send initial login command (using stored credentials)
    if let Ok(mut stdin) = stdin.lock() {
        writeln!(&mut stdin, "login {}", credentials.username)
            .map_err(|e| format!("Failed to send login command: {}", e))?;

        // Send update command
        writeln!(&mut stdin, "app_update {} validate", app_id)
            .map_err(|e| format!("Failed to send update command: {}", e))?;

        // Send quit command
        writeln!(&mut stdin, "quit")
            .map_err(|e| format!("Failed to send quit command: {}", e))?;
    }

    // Wait for the process to complete
    let status = child.wait()
        .map_err(|e| format!("Failed to wait for SteamCMD: {}", e))?;

    if status.success() {
        Ok(format!("Successfully updated app {}", app_id))
    } else {
        Err("Update process failed".to_string())
    }
}

// Add a new command handler for 2FA code submission
#[tauri::command]
pub async fn submit_2fa_code(
    code: String,
    stdin: tauri::State<'_, std::sync::Mutex<std::process::ChildStdin>>
) -> Result<(), String> {
    let mut stdin = stdin.lock()
        .map_err(|e| format!("Failed to lock stdin: {}", e))?;
    
    writeln!(stdin, "{}", code)
        .map_err(|e| format!("Failed to send 2FA code: {}", e))?;
    
    Ok(())
}

pub(crate) async fn authenticate_steam(
    app: AppHandle,
    credentials: SteamCredentials
) -> Result<String, String> {
    let steamcmd_dir = get_steamcmd_dir(&app)?;
    
    let steamcmd_path = {
        #[cfg(target_os = "windows")]
        {
            steamcmd_dir.join("steamcmd.exe")
        }
        #[cfg(not(target_os = "windows"))]
        {
            let path = steamcmd_dir.join("steamcmd.sh");
            
            // Ensure the file is executable
            let output = Command::new("chmod")
                .args(&["+x", path.to_str().unwrap()])
                .output()
                .map_err(|e| format!("Failed to make steamcmd executable: {}", e))?;

            if !output.status.success() {
                return Err("Failed to make steamcmd executable".to_string());
            }
            
            path
        }
    };

    if !steamcmd_path.exists() {
        return Err(format!("SteamCMD not found at {:?}", steamcmd_path));
    }

    dev_log!("Starting Steam authentication...");
    
    // First attempt - this will always trigger 2FA
    let mut args = vec![
        "+login".to_string(),
        credentials.username.clone(),
        credentials.password.clone(),
    ];
    args.push("+quit".to_string());

    let output = Command::new(&steamcmd_path)
        .current_dir(&steamcmd_dir)
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to execute SteamCMD: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    dev_log!("Initial auth attempt stdout:\n{}", stdout);
    if !stderr.is_empty() {
        dev_log!("Initial auth attempt stderr:\n{}", stderr);
    }

    // Check for invalid credentials first
    if stdout.contains("Invalid Password") {
        return Err("Invalid username or password".to_string());
    }

    // If we don't have a 2FA code yet, request it
    if credentials.two_factor_code.is_none() {
        if stdout.contains("Steam Guard code") || stdout.contains("Two-factor code:") {
            return Err("Steam Guard code required".to_string());
        }
    }

    // If we have a 2FA code, try the full authentication
    if let Some(code) = credentials.two_factor_code {
        dev_log!("Attempting authentication with 2FA code...");
        let mut args = vec![
            "+login".to_string(),
            credentials.username.clone(),
            credentials.password.clone(),
            code,
        ];
        args.push("+quit".to_string());

        let output = Command::new(&steamcmd_path)
            .current_dir(&steamcmd_dir)
            .args(&args)
            .output()
            .map_err(|e| format!("Failed to execute SteamCMD: {}", e))?;

        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);

        dev_log!("2FA auth attempt stdout:\n{}", stdout);
        if !stderr.is_empty() {
            dev_log!("2FA auth attempt stderr:\n{}", stderr);
        }

        if stdout.contains("Invalid Steam Guard code") || stdout.contains("Invalid two-factor code") {
            return Err("Invalid Steam Guard code".to_string());
        }

        if stdout.contains("Waiting for user info...OK") {
            dev_log!("Authentication successful, saving credentials");
            if let Err(e) = db::save_credentials(
                &credentials.username,
                &credentials.password.clone()
            ) {
                dev_log!("Failed to save credentials: {}", e);
            }
            Ok(format!("Successfully authenticated as {}", credentials.username))
        } else if stdout.contains("Invalid Password") {
            Err("Invalid username or password".to_string())
        } else if stdout.contains("Invalid Steam Guard code") || stdout.contains("Invalid two-factor code") {
            Err("Invalid Steam Guard code".to_string())
        } else if !stdout.contains("Steam Guard code provided") {
            Err("Steam Guard code required".to_string())
        } else {
            dev_log!("Authentication completed but success message not found");
            dev_log!("Full output:\n{}", stdout);
            Err("Authentication failed. Please check your credentials and try again.".to_string())
        }
    } else {
        // This should never happen due to the earlier check, but just in case
        Err("Steam Guard code required".to_string())
    }
}

pub(crate) async fn get_stored_credentials(_app: AppHandle) -> Result<Option<SteamCredentials>, String> {
    match db::get_credentials() {
        Ok(Some((username, password))) => Ok(Some(SteamCredentials {
            username,
            password,
            two_factor_code: None
        })),
        Ok(None) => Ok(None),
        Err(e) => Err(format!("Failed to get credentials: {}", e))
    }
}

pub(crate) async fn clear_stored_credentials(_app: AppHandle) -> Result<(), String> {
    db::clear_credentials()
        .map_err(|e| format!("Failed to clear credentials: {}", e))
} 