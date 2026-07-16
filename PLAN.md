# Plan: Features para Uso Cotidiano

## Resumen del Proyecto Actual

```
tasksassistant/
├── src/components/
│   ├── CalendarView.tsx      # Vista mensual
│   ├── ConfirmModal.tsx      # Modal de confirmación
│   ├── Dashboard.tsx         # Lista de proyectos + calendario global
│   ├── DayTasksModal.tsx     # Tareas por día
│   ├── ProjectView.tsx       # Kanban board + calendario por proyecto
│   └── TaskCard.tsx          # Tarjeta de tarea (draggable)
├── src/services/api.ts       # Wrappers de Tauri invoke
├── src/types/index.ts        # Interfaces TypeScript
├── src-tauri/src/db.rs       # Schema SQLite + CRUD
├── src-tauri/src/lib.rs      # Comandos Tauri (11 comandos)
└── src-tauri/Cargo.toml      # Dependencias Rust
```

**Tecnologías:** Tauri v2, React 19, TypeScript 6, Vite 8, rusqlite, @hello-pangea/dnd, JetBrains Mono

**DB:** SQLite con tablas `projects` (id, name, description, status, created_at) y `tasks` (id, project_id, title, description, priority, status, due_date, due_time, created_at)

---

## Fase 1: Vista "Hoy" + Búsqueda + Estadísticas

> Prioridad: 🔴 Alta | Dificultad: Fácil

### 1.1 Vista "Hoy" (`TodayView.tsx`)

**Nuevo componente** que muestra todas las tareas vencidas hoy, pendientes, y próximas.

**Ubicación:** Nuevo botón "Today" en el header del Dashboard, similar al "Calendar".

**Funcionalidad:**
- Sección "Overdue": tareas con `due_date < hoy` y `status != 'completed'` (rojo)
- Sección "Due Today": tareas con `due_date = hoy` y `status != 'completed'` (amarillo)
- Sección "Upcoming": tareas de los próximos 7 días (azul)
- Cada tarea muestra: título, prioridad, fecha, nombre del proyecto
- Click en tarea → abre modal de edición

**Backend:** Nuevo comando `get_today_tasks()` en `lib.rs` que ejecuta SQL con `WHERE due_date <= date('now') AND status != 'completed'`

**Archivos a crear/modify:**
- `src/components/TodayView.tsx` — **nuevo**
- `src/services/api.ts` — agregar `getTodayTasks()`
- `src-tauri/src/db.rs` — función `get_today_tasks()`
- `src-tauri/src/lib.rs` — comando `get_today_tasks`
- `src/components/Dashboard.tsx` — agregar botón "Today" en header

---

### 1.2 Búsqueda (`SearchBar.tsx`)

**Nuevo componente** barra de búsqueda global.

**Ubicación:** Header del Dashboard, visible siempre.

**Funcionalidad:**
- Input con icono 🔍, placeholder "Search tasks..."
- Búsqueda en tiempo real (debounce 300ms)
- Filtra por título y descripción de tareas (case-insensitive)
- Muestra resultados con nombre del proyecto
- Click en resultado → navega al proyecto y abre la tarea

**Backend:** Nuevo comando `search_tasks(query)` con SQL `LIKE '%query%'`

**Archivos a crear/modify:**
- `src/components/SearchBar.tsx` — **nuevo**
- `src/services/api.ts` — agregar `searchTasks(query)`
- `src-tauri/src/db.rs` — función `search_tasks()`
- `src-tauri/src/lib.rs` — comando `search_tasks`
- `src/components/Dashboard.tsx` — agregar SearchBar en header

---

### 1.3 Estadísticas (`StatsBar.tsx`)

**Nuevo componente** barra de estadísticas resumidas.

**Ubicación:** Debajo del header del Dashboard.

**Funcionalidad:**
- Cards con métricas:
  - 📋 Total tasks (todas)
  - ⏳ Pending (status=pending)
  - 🔄 In Progress (status=in_progress)
  - ✅ Completed (status=completed)
  - ⚠️ Overdue (due_date < hoy AND status != completed)
  - 📅 Due Today (due_date = hoy AND status != completed)

**Backend:** Nuevo comando `get_task_stats()` que ejecuta queries de agregación

**Archivos a crear/modify:**
- `src/components/StatsBar.tsx` — **nuevo**
- `src/services/api.ts` — agregar `getTaskStats()`
- `src-tauri/src/db.rs` — función `get_task_stats()`
- `src-tauri/src/lib.rs` — comando `get_task_stats`
- `src/components/Dashboard.tsx` — agregar StatsBar

---

## Fase 2: Notificaciones + System Tray

> Prioridad: 🟡 Media | Dificultad: Media

### 2.1 Notificaciones

**Dependencia:** `tauri-plugin-notification` (agregar a `Cargo.toml` y `package.json`)

**Funcionalidad:**
- Al abrir la app: verificar tareas vencidas hoy y mostrar notificación
- Verificar tareas con `due_time` próxima (15 min antes)
- Notificación al completar una tarea

**Backend:**
- Agregar `tauri-plugin-notification` a dependencias
- Nuevo comando `check_reminders()` que se ejecuta al iniciar la app
- Nuevo comando `send_notification(title, body)` desde frontend

**Archivos a modificar:**
- `src-tauri/Cargo.toml` — agregar dependencia
- `package.json` — agregar dependencia
- `src-tauri/src/lib.rs` — inicializar plugin, comandos
- `src/App.tsx` — llamar `check_reminders()` al montar
- `src-tauri/capabilities/default.json` — agregar permisos de notificación

---

### 2.2 System Tray

**Dependencia:** Sistema de Tauri v2 (ya incluido)

**Funcionalidad:**
- Minimizar a tray al cerrar ventana
- Menú contextual: "Abrir", "Hoy", "Salir"
- Badge con número de tareas pendientes

**Archivos a modificar:**
- `src-tauri/tauri.conf.json` — configuración de ventana
- `src-tauri/src/lib.rs` — handler de tray events

---

## Fase 3: Atajos de Teclado + Quick-add

> Prioridad: 🟡 Media | Dificultad: Fácil

### 3.1 Atajos de Teclado

**Funcionalidad:**
- `Escape` — cerrar cualquier modal abierto
- `Ctrl+K` — abrir búsqueda (focus en SearchBar)
- `Ctrl+N` — abrir modal de crear tarea
- `Ctrl+T` — navegar a vista "Today"
- `Ctrl+B` — volver al Dashboard

**Implementación:** Event listener global en `App.tsx` o `useEffect` en componentes

**Archivos a modificar:**
- `src/App.tsx` — listener global de teclado

---

### 3.2 Quick-add Task

**Funcionalidad:**
- Input inline en el header de cada columna Kanban
- Al presionar Enter → crea tarea con título ingresado
- Prioridad por defecto: medium
- Fecha por defecto: hoy
- Status: columna actual

**Archivos a modificar:**
- `src/components/ProjectView.tsx` — reemplazar botón `+` por input inline

---

## Fase 4: Editar Proyecto

> Prioridad: 🟠 Baja | Dificultad: Fácil

### 4.1 Editar nombre/descripción de proyecto

**Funcionalidad:**
- Click en nombre del proyecto → abre modal de edición
- Modal con campos: nombre, descripción
- Botón "Save" para guardar cambios

**Backend:** Nuevo comando `update_project(id, name, description)`

**Archivos a crear/modify:**
- `src-tauri/src/db.rs` — función `update_project()`
- `src-tauri/src/lib.rs` — comando `update_project`
- `src/services/api.ts` — función `updateProject()`
- `src/components/Dashboard.tsx` — modal de edición de proyecto

---

## Orden de Implementación Recomendado

| Paso | Feature | Esfuerzo | Dependencias |
|------|---------|----------|--------------|
| 1 | Vista "Hoy" | Fácil | Ninguna |
| 2 | Búsqueda | Fácil | Ninguna |
| 3 | Estadísticas | Fácil | Ninguna |
| 4 | Atajos de teclado | Fácil | Ninguna |
| 5 | Quick-add Task | Fácil | Ninguna |
| 6 | Editar Proyecto | Fácil | Ninguna |
| 7 | Notificaciones | Media | tauri-plugin-notification |
| 8 | System Tray | Media | Config Tauri |

---

## Archivos del Proyecto (Referencia Rápida)

| Archivo | Propósito |
|---------|-----------|
| `src-tauri/src/db.rs` | Schema DB, funciones CRUD, migraciones |
| `src-tauri/src/lib.rs` | Comandos Tauri expuestos al frontend |
| `src-tauri/Cargo.toml` | Dependencias Rust |
| `src-tauri/tauri.conf.json` | Configuración de ventana y bundling |
| `src-tauri/capabilities/default.json` | Permisos de Tauri |
| `src/types/index.ts` | Interfaces TypeScript (Project, Task) |
| `src/services/api.ts` | Wrappers de invoke para cada comando |
| `src/App.tsx` | Router principal (Dashboard vs ProjectView) |
| `src/App.css` | Todos los estilos (dark theme, glassmorphism) |
| `src/components/Dashboard.tsx` | Lista de proyectos + calendario global |
| `src/components/ProjectView.tsx` | Kanban board + calendario por proyecto |
| `src/components/TaskCard.tsx` | Tarjeta de tarea draggable |
| `src/components/CalendarView.tsx` | Cuadrícula mensual |
| `src/components/DayTasksModal.tsx` | Modal de tareas por día |
| `src/components/ConfirmModal.tsx` | Modal de confirmación reutilizable |

---

## Convenciones del Código

- **Idioma:** Todo el código y UI en inglés
- **Estilos:** Dark theme (`#0a0a0a`), glassmorphism, JetBrains Mono
- **Backend:** Funciones en `db.rs` → comandos en `lib.rs` → wrappers en `api.ts`
- **Frontend:** Componentes en `src/components/`, hooks en componentes
- **DB:** Migraciones con `ALTER TABLE` + check de columna existente
- **Build:** Verificar con `npx tsc --noEmit` y `cargo check` antes de commitear

---

## Notas para el Agente

1. **Siempre ejecutar** `npx tsc --noEmit` y `cargo check` después de cambios
2. **Migraciones DB:** Usar patrón de check + ALTER TABLE (ver `db.rs:50-54`)
3. **Nuevo comando Tauri:** Agregar a `lib.rs` (fn + generate_handler) y a `api.ts`
4. **Nuevo componente:** Crear en `src/components/`, importar en donde se use
5. **CSS:** Agregar estilos nuevos en `App.css` después de la sección existente correspondiente
6. **Permisos Tauri:** Actualizar `capabilities/default.json` al agregar plugins
