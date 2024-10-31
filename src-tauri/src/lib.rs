mod steam;
mod db;

use tauri::AppHandle;
use crate::steam::SteamCredentials;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn ensure_steamcmd(app: AppHandle) -> Result<String, String> {
    steam::ensure_steamcmd(app).await
}

#[tauri::command]
async fn update_game(app: AppHandle, app_id: u32) -> Result<String, String> {
    steam::update_game(app, app_id).await
}

#[tauri::command]
async fn update_game_authenticated(
    app: AppHandle,
    app_id: u32,
    credentials: SteamCredentials
) -> Result<String, String> {
    steam::update_game_authenticated(app, app_id, credentials).await
}

#[tauri::command]
async fn authenticate_steam(
    app: AppHandle,
    credentials: SteamCredentials
) -> Result<String, String> {
    steam::authenticate_steam(app, credentials).await
}

#[tauri::command]
async fn get_stored_credentials(app: AppHandle) -> Result<Option<SteamCredentials>, String> {
    steam::get_stored_credentials(app).await
}

#[tauri::command]
async fn clear_stored_credentials(app: AppHandle) -> Result<(), String> {
    steam::clear_stored_credentials(app).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|_app| {
            db::init_db().map_err(|e| format!("Failed to initialize database: {}", e))?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet, 
            ensure_steamcmd,
            update_game,
            update_game_authenticated,
            authenticate_steam,
            get_stored_credentials,
            clear_stored_credentials
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
