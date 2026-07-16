mod db;

use std::sync::Mutex;
use rusqlite::Connection;
use tauri::State;

struct AppState {
    conn: Mutex<Connection>,
}

#[tauri::command]
fn create_project(state: State<AppState>, name: String, description: String) -> Result<db::Project, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::create_project(&conn, &name, &description).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_projects(state: State<AppState>) -> Result<Vec<db::Project>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::get_projects(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_projects_by_status(state: State<AppState>, status: String) -> Result<Vec<db::Project>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::get_projects_by_status(&conn, &status).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_project_status(state: State<AppState>, id: String, status: String) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::update_project_status(&conn, &id, &status).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_project(state: State<AppState>, id: String) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::delete_project(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_task(state: State<AppState>, project_id: String, title: String, description: String, priority: String, due_date: String, due_time: Option<String>) -> Result<db::Task, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::create_task(&conn, &project_id, &title, &description, &priority, &due_date, due_time.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_tasks(state: State<AppState>, project_id: String) -> Result<Vec<db::Task>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::get_tasks(&conn, &project_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn move_task(state: State<AppState>, task_id: String, new_status: String) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::move_task(&conn, &task_id, &new_status).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_task(state: State<AppState>, id: String) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::delete_task(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_task(state: State<AppState>, task_id: String, title: String, description: String, priority: String, due_date: String, due_time: Option<String>) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::update_task(&conn, &task_id, &title, &description, &priority, &due_date, due_time.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_all_tasks(state: State<AppState>) -> Result<Vec<db::Task>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::get_all_tasks(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_all_tasks_with_projects(state: State<AppState>) -> Result<Vec<db::TaskWithProject>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::get_all_tasks_with_projects(&conn).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_dir = if cfg!(target_os = "linux") {
        let home = std::env::var("HOME").expect("HOME not set");
        std::path::PathBuf::from(home).join(".local/share").join("com.aserrador.tasksassistant")
    } else if cfg!(target_os = "macos") {
        let home = std::env::var("HOME").expect("HOME not set");
        std::path::PathBuf::from(home).join("Library/Application Support").join("com.aserrador.tasksassistant")
    } else if cfg!(target_os = "windows") {
        let appdata = std::env::var("APPDATA").expect("APPDATA not set");
        std::path::PathBuf::from(appdata).join("com.aserrador.tasksassistant")
    } else {
        std::path::PathBuf::from(".")
    };
    std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
    let db_path = app_dir.join("tasks.db");
    let conn = Connection::open(&db_path).expect("Failed to open database");
    db::init_db(&conn).expect("Failed to initialize database");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState { conn: Mutex::new(conn) })
        .invoke_handler(tauri::generate_handler![
            create_project,
            get_projects,
            get_projects_by_status,
            update_project_status,
            delete_project,
            create_task,
            get_tasks,
            move_task,
            delete_task,
            update_task,
            get_all_tasks,
            get_all_tasks_with_projects
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
