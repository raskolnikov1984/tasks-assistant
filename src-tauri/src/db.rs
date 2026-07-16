use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: String,
    pub status: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub project_id: String,
    pub title: String,
    pub description: String,
    pub priority: String,
    pub status: String,
    pub due_date: String,
    pub due_time: Option<String>,
    pub created_at: String,
}

pub fn init_db(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            priority TEXT NOT NULL DEFAULT 'medium',
            status TEXT NOT NULL DEFAULT 'pending',
            due_date TEXT NOT NULL DEFAULT (date('now')),
            due_time TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );"
    )?;

    // Migration: add status column to existing projects table
    let has_status: bool = conn.prepare("SELECT status FROM projects LIMIT 1").is_ok();
    if !has_status {
        conn.execute_batch("ALTER TABLE projects ADD COLUMN status TEXT NOT NULL DEFAULT 'open';")?;
    }

    Ok(())
}

pub fn create_project(conn: &Connection, name: &str, description: &str) -> Result<Project> {
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO projects (id, name, description) VALUES (?1, ?2, ?3)",
        (&id, name, description),
    )?;
    Ok(Project {
        id,
        name: name.to_string(),
        description: description.to_string(),
        status: "open".to_string(),
        created_at: chrono::Utc::now().to_string(),
    })
}

pub fn get_projects(conn: &Connection) -> Result<Vec<Project>> {
    let mut stmt = conn.prepare("SELECT id, name, description, status, created_at FROM projects")?;
    let projects = stmt
        .query_map([], |row| {
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                status: row.get(3)?,
                created_at: row.get(4)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;
    Ok(projects)
}

pub fn get_projects_by_status(conn: &Connection, status: &str) -> Result<Vec<Project>> {
    let mut stmt = conn.prepare("SELECT id, name, description, status, created_at FROM projects WHERE status = ?1")?;
    let projects = stmt
        .query_map([status], |row| {
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                status: row.get(3)?,
                created_at: row.get(4)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;
    Ok(projects)
}

pub fn update_project_status(conn: &Connection, id: &str, status: &str) -> Result<()> {
    conn.execute(
        "UPDATE projects SET status = ?1 WHERE id = ?2",
        (status, id),
    )?;
    Ok(())
}

pub fn delete_project(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM tasks WHERE project_id = ?1", [id])?;
    conn.execute("DELETE FROM projects WHERE id = ?1", [id])?;
    Ok(())
}

pub fn create_task(
    conn: &Connection,
    project_id: &str,
    title: &str,
    description: &str,
    priority: &str,
    due_date: &str,
    due_time: Option<&str>,
) -> Result<Task> {
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO tasks (id, project_id, title, description, priority, status, due_date, due_time) VALUES (?1, ?2, ?3, ?4, ?5, 'pending', ?6, ?7)",
        (&id, project_id, title, description, priority, due_date, due_time),
    )?;
    Ok(Task {
        id,
        project_id: project_id.to_string(),
        title: title.to_string(),
        description: description.to_string(),
        priority: priority.to_string(),
        status: "pending".to_string(),
        due_date: due_date.to_string(),
        due_time: due_time.map(|s| s.to_string()),
        created_at: chrono::Utc::now().to_string(),
    })
}

pub fn get_tasks(conn: &Connection, project_id: &str) -> Result<Vec<Task>> {
    let mut stmt = conn.prepare(
        "SELECT id, project_id, title, description, priority, status, due_date, due_time, created_at FROM tasks WHERE project_id = ?1"
    )?;
    let tasks = stmt
        .query_map([project_id], |row| {
            Ok(Task {
                id: row.get(0)?,
                project_id: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                priority: row.get(4)?,
                status: row.get(5)?,
                due_date: row.get(6)?,
                due_time: row.get(7)?,
                created_at: row.get(8)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;
    Ok(tasks)
}

pub fn move_task(conn: &Connection, task_id: &str, new_status: &str) -> Result<()> {
    conn.execute(
        "UPDATE tasks SET status = ?1 WHERE id = ?2",
        (new_status, task_id),
    )?;
    Ok(())
}

pub fn delete_task(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM tasks WHERE id = ?1", [id])?;
    Ok(())
}

pub fn update_task(
    conn: &Connection,
    task_id: &str,
    title: &str,
    description: &str,
    priority: &str,
    due_date: &str,
    due_time: Option<&str>,
) -> Result<()> {
    conn.execute(
        "UPDATE tasks SET title = ?1, description = ?2, priority = ?3, due_date = ?4, due_time = ?5 WHERE id = ?6",
        (title, description, priority, due_date, due_time, task_id),
    )?;
    Ok(())
}

pub fn get_all_tasks(conn: &Connection) -> Result<Vec<Task>> {
    let mut stmt = conn.prepare(
        "SELECT id, project_id, title, description, priority, status, due_date, due_time, created_at FROM tasks"
    )?;
    let tasks = stmt
        .query_map([], |row| {
            Ok(Task {
                id: row.get(0)?,
                project_id: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                priority: row.get(4)?,
                status: row.get(5)?,
                due_date: row.get(6)?,
                due_time: row.get(7)?,
                created_at: row.get(8)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;
    Ok(tasks)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TaskWithProject {
    pub id: String,
    pub project_id: String,
    pub project_name: String,
    pub title: String,
    pub description: String,
    pub priority: String,
    pub status: String,
    pub due_date: String,
    pub due_time: Option<String>,
    pub created_at: String,
}

pub fn get_all_tasks_with_projects(conn: &Connection) -> Result<Vec<TaskWithProject>> {
    let mut stmt = conn.prepare(
        "SELECT t.id, t.project_id, p.name, t.title, t.description, t.priority, t.status, t.due_date, t.due_time, t.created_at
         FROM tasks t
         JOIN projects p ON t.project_id = p.id
         ORDER BY t.due_date ASC"
    )?;
    let tasks = stmt
        .query_map([], |row| {
            Ok(TaskWithProject {
                id: row.get(0)?,
                project_id: row.get(1)?,
                project_name: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                priority: row.get(5)?,
                status: row.get(6)?,
                due_date: row.get(7)?,
                due_time: row.get(8)?,
                created_at: row.get(9)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;
    Ok(tasks)
}
