import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Project, Task, TaskWithProject } from '../types';
import { CalendarView } from './CalendarView';
import { ConfirmModal } from './ConfirmModal';
import { AllTasksView } from './AllTasksView';

interface DashboardProps {
  onSelectProject: (project: Project) => void;
}

export function Dashboard({ onSelectProject }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | TaskWithProject | null>(null);
  const [creatingTaskDate, setCreatingTaskDate] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createPriority, setCreatePriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [createDueTime, setCreateDueTime] = useState('');
  const [projectFilter, setProjectFilter] = useState<'all' | 'open' | 'closed'>('open');
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [allTasksWithProjects, setAllTasksWithProjects] = useState<TaskWithProject[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const data = await api.getProjects();
    setProjects(data);
  }

  async function loadAllTasks() {
    const data = await api.getAllTasks();
    setAllTasks(data);
  }

  function handleOpenCalendar() {
    loadAllTasks();
    setShowCalendar(true);
  }

  async function loadAllTasksWithProjects() {
    const data = await api.getAllTasksWithProjects();
    setAllTasksWithProjects(data);
  }

  function handleOpenAllTasks() {
    loadAllTasksWithProjects();
    setShowAllTasks(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await api.createProject(name, description);
    setName('');
    setDescription('');
    setShowModal(false);
    loadProjects();
  }

  async function handleDelete(id: string) {
    setDeleteProjectId(id);
  }

  async function confirmDeleteProject() {
    if (!deleteProjectId) return;
    await api.deleteProject(deleteProjectId);
    setDeleteProjectId(null);
    loadProjects();
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    await api.updateProjectStatus(id, newStatus);
    loadProjects();
  }

  async function handleUpdateTask() {
    if (!editingTask) return;
    await api.updateTask(editingTask.id, editingTask.title, editingTask.description, editingTask.priority, editingTask.due_date, editingTask.due_time);
    setEditingTask(null);
    loadAllTasks();
  }

  function handleCreateFromCalendar(date: string) {
    setCreatingTaskDate(date);
    const openProjects = projects.filter((p) => p.status === 'open');
    setSelectedProjectId(openProjects.length > 0 ? openProjects[0].id : '');
    setCreateTitle('');
    setCreateDescription('');
    setCreatePriority('medium');
    setCreateDueTime('');
  }

  function closeCreateModal() {
    setCreatingTaskDate(null);
    setSelectedProjectId('');
    setCreateTitle('');
    setCreateDescription('');
    setCreatePriority('medium');
    setCreateDueTime('');
  }

  async function handleCreateTaskSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!createTitle.trim() || !creatingTaskDate || !selectedProjectId) return;
    await api.createTask(selectedProjectId, createTitle, createDescription, createPriority, creatingTaskDate, createDueTime || null);
    closeCreateModal();
    loadAllTasks();
  }

  const filteredProjects = projectFilter === 'all'
    ? projects
    : projects.filter((p) => p.status === projectFilter);

  const openProjectsForCalendar = projects.filter((p) => p.status === 'open');

  if (showCalendar) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <button className="btn-back" onClick={() => setShowCalendar(false)}>← Projects</button>
          <h1>Calendar</h1>
          <button className="btn-primary" onClick={() => { loadAllTasks(); }}>↻ Refresh</button>
        </div>
        <CalendarView tasks={allTasks} onEditTask={setEditingTask} onCreateTask={handleCreateFromCalendar} />

        {editingTask && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Edit Task</h2>
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              />
              <textarea
                value={editingTask.description}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              />
              <select
                value={editingTask.priority}
                onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div className="datetime-row">
                <div className="datetime-field">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={editingTask.due_date}
                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                  />
                </div>
                <div className="datetime-field">
                  <label>Time (optional)</label>
                  <input
                    type="time"
                    value={editingTask.due_time || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, due_time: e.target.value || null })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingTask(null)}>Cancel</button>
                <button type="button" className="btn-primary" onClick={handleUpdateTask}>Save</button>
              </div>
            </div>
          </div>
        )}

        {creatingTaskDate && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Create Task</h2>
              <form onSubmit={handleCreateTaskSubmit}>
                <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
                  {openProjectsForCalendar.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Task title"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                />
                <textarea
                  placeholder="Description"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                />
                <select value={createPriority} onChange={(e) => setCreatePriority(e.target.value as 'low' | 'medium' | 'high')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <div className="datetime-row">
                  <div className="datetime-field">
                    <label>Due Date</label>
                    <input type="date" value={creatingTaskDate} readOnly />
                  </div>
                  <div className="datetime-field">
                    <label>Time (optional)</label>
                    <input type="time" value={createDueTime} onChange={(e) => setCreateDueTime(e.target.value)} />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={closeCreateModal}>Cancel</button>
                  <button type="submit" className="btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (showAllTasks) {
    return (
      <>
        <AllTasksView
          tasks={allTasksWithProjects}
          onEditTask={(task) => setEditingTask(task)}
          onBack={() => setShowAllTasks(false)}
          onRefresh={loadAllTasksWithProjects}
        />

        {editingTask && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Edit Task</h2>
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              />
              <textarea
                value={editingTask.description}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              />
              <select
                value={editingTask.priority}
                onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div className="datetime-row">
                <div className="datetime-field">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={editingTask.due_date}
                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                  />
                </div>
                <div className="datetime-field">
                  <label>Time (optional)</label>
                  <input
                    type="time"
                    value={editingTask.due_time || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, due_time: e.target.value || null })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingTask(null)}>Cancel</button>
                <button type="button" className="btn-primary" onClick={handleUpdateTask}>Save</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Projects</h1>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn${projectFilter === 'all' ? ' active' : ''}`}
              onClick={() => setProjectFilter('all')}
            >All</button>
            <button
              className={`toggle-btn${projectFilter === 'open' ? ' active' : ''}`}
              onClick={() => setProjectFilter('open')}
            >Open</button>
            <button
              className={`toggle-btn${projectFilter === 'closed' ? ' active' : ''}`}
              onClick={() => setProjectFilter('closed')}
            >Closed</button>
          </div>
          <button className="btn-back" onClick={handleOpenAllTasks}>📋 All Tasks</button>
          <button className="btn-back" onClick={handleOpenCalendar}>📅 Calendar</button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        </div>
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project) => (
          <div key={project.id} className={`project-card${project.status === 'closed' ? ' closed' : ''}`}>
            <div className="project-card-header">
              <h2
                className={project.status === 'closed' ? 'no-click' : ''}
                onClick={() => project.status === 'open' && onSelectProject(project)}
              >{project.name}</h2>
              <span className={`project-status ${project.status}`}>{project.status}</span>
            </div>
            <p>{project.description}</p>
            <div className="project-card-actions">
              <button className="btn-toggle-status" onClick={() => handleToggleStatus(project.id, project.status)}>
                {project.status === 'open' ? 'Close' : 'Reopen'}
              </button>
              <button className="btn-delete" onClick={() => handleDelete(project.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {deleteProjectId && (
        <ConfirmModal
          message="Delete this project and all its tasks?"
          onConfirm={confirmDeleteProject}
          onCancel={() => setDeleteProjectId(null)}
        />
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Project</h2>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
