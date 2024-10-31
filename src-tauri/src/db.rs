use rusqlite::{Connection, Result};
use std::path::PathBuf;
use std::env;

pub fn get_db_path() -> Result<PathBuf, String> {
    let exe_path = env::current_exe()
        .map_err(|e| format!("Failed to get executable path: {}", e))?;
    
    let app_dir = exe_path
        .parent()
        .ok_or_else(|| "Failed to get parent directory".to_string())?;
    
    Ok(app_dir.join("steam.db"))
}

pub fn init_db() -> Result<()> {
    let db_path = get_db_path().map_err(|e| rusqlite::Error::SqliteFailure(
        rusqlite::ffi::Error::new(1), Some(e)
    ))?;

    let conn = Connection::open(db_path)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS steam_credentials (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )",
        [],
    )?;

    Ok(())
}

pub fn save_credentials(username: &str, password: &str) -> Result<()> {
    let db_path = get_db_path().map_err(|e| rusqlite::Error::SqliteFailure(
        rusqlite::ffi::Error::new(1), Some(e)
    ))?;

    let conn = Connection::open(db_path)?;

    conn.execute(
        "INSERT OR REPLACE INTO steam_credentials (username, password) VALUES (?1, ?2)",
        [username, password],
    )?;

    Ok(())
}

pub fn get_credentials() -> Result<Option<(String, String)>> {
    let db_path = get_db_path().map_err(|e| rusqlite::Error::SqliteFailure(
        rusqlite::ffi::Error::new(1), Some(e)
    ))?;

    let conn = Connection::open(db_path)?;

    let mut stmt = conn.prepare("SELECT username, password FROM steam_credentials LIMIT 1")?;
    let mut rows = stmt.query([])?;

    if let Some(row) = rows.next()? {
        Ok(Some((
            row.get(0)?,
            row.get(1)?
        )))
    } else {
        Ok(None)
    }
}

pub fn clear_credentials() -> Result<()> {
    let db_path = get_db_path().map_err(|e| rusqlite::Error::SqliteFailure(
        rusqlite::ffi::Error::new(1), Some(e)
    ))?;

    let conn = Connection::open(db_path)?;
    conn.execute("DELETE FROM steam_credentials", [])?;
    Ok(())
} 