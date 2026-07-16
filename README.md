# Tasks Assistant

Desktop task management application built with Tauri v2 + React + TypeScript.

## Features

- **Projects**: Create, edit, and delete projects with open/closed status filter
- **Kanban Board**: Drag & drop tasks between Pending, In Progress, and Completed columns
- **Calendar View**: Monthly grid showing tasks by due date, click any day to view or create tasks
- **All Tasks View**: See all tasks across all projects with project identification
- **Task Management**: Title, description, priority (low/medium/high), due date, optional time
- **Edit Tasks**: Click any task card to edit inline via modal
- **Dark Theme**: Glassmorphism UI with JetBrains Mono font
- **Confirmation Modals**: Styled delete confirmations matching the app design
- **Project Status**: Open/closed status with filter toggle, closed projects cannot be navigated

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript 6, Vite 8 |
| Backend | Rust, Tauri v2 |
| Database | SQLite (rusqlite) |
| Drag & Drop | @hello-pangea/dnd |
| Font | JetBrains Mono |

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (rustup)
- [Node.js](https://nodejs.org/) 18+
- Tauri v2 system dependencies ([see guide](https://v2.tauri.app/start/prerequisites/))

## Installation

```bash
npm install
```

## Development

```bash
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

## Project Structure

```
tasksassistant/
├── src/                          # Frontend source
│   ├── components/
│   │   ├── AllTasksView.tsx      # All tasks across projects with filters
│   │   ├── CalendarView.tsx      # Monthly calendar with task dots
│   │   ├── ConfirmModal.tsx      # Reusable delete confirmation modal
│   │   ├── Dashboard.tsx         # Projects list, global calendar, filters
│   │   ├── DayTasksModal.tsx     # Tasks for a specific day
│   │   ├── ProjectView.tsx       # Kanban board + calendar toggle
│   │   └── TaskCard.tsx          # Draggable task card
│   ├── services/
│   │   └── api.ts                # Tauri invoke wrappers
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── App.tsx                   # Root router
│   └── App.css                   # All styles
├── src-tauri/                    # Backend source
│   ├── src/
│   │   ├── db.rs                 # SQLite schema, CRUD operations
│   │   └── lib.rs                # Tauri commands registration
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Tauri configuration
├── package.json
├── PLAN.md                       # Future features roadmap
└── README.md
```

## Database Schema

**projects**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| name | TEXT | Project name |
| description | TEXT | Project description |
| status | TEXT | `open` or `closed` (default: `open`) |
| created_at | TIMESTAMP | Creation timestamp |

**tasks**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| project_id | TEXT | Foreign key to projects |
| title | TEXT | Task title |
| description | TEXT | Task description |
| priority | TEXT | `low`, `medium`, or `high` |
| status | TEXT | `pending`, `in_progress`, or `completed` |
| due_date | TEXT | Due date (YYYY-MM-DD) |
| due_time | TEXT | Optional time (HH:MM) |
| created_at | TIMESTAMP | Creation timestamp |

## Tauri Commands

| Command | Parameters | Description |
|---------|-----------|-------------|
| `create_project` | name, description | Create a new project |
| `get_projects` | - | Get all projects |
| `get_projects_by_status` | status | Filter projects by status |
| `update_project_status` | id, status | Toggle project open/closed |
| `delete_project` | id | Delete project and its tasks |
| `create_task` | projectId, title, description, priority, dueDate, dueTime | Create a task |
| `get_tasks` | projectId | Get tasks for a project |
| `get_all_tasks` | - | Get all tasks (for global calendar) |
| `update_task` | taskId, title, description, priority, dueDate, dueTime | Update a task |
| `move_task` | taskId, newStatus | Move task to new status column |
| `delete_task` | id | Delete a task |
| `get_all_tasks_with_projects` | - | Get all tasks with project names |

## Database Location

The SQLite database is stored in a fixed location per platform:

| OS | Path |
|----|------|
| **Linux** | `~/.local/share/com.aserrador.tasksassistant/tasks.db` |
| **macOS** | `~/Library/Application Support/com.aserrador.tasksassistant/tasks.db` |
| **Windows** | `%APPDATA%/com.aserrador.tasksassistant/tasks.db` |

The database is automatically created on first run and migrations are applied automatically.

## Roadmap

See [PLAN.md](PLAN.md) for detailed implementation plan of upcoming features:

- **Phase 1**: Today view, Search, Dashboard stats
- **Phase 2**: Notifications, System Tray
- **Phase 3**: Keyboard shortcuts, Quick-add tasks
- **Phase 4**: Edit project name/description
