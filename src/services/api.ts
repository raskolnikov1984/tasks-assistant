import { invoke } from '@tauri-apps/api/core';
import { Project, Task, TaskWithProject } from '../types';

export const api = {
  createProject: (name: string, description: string) =>
    invoke<Project>('create_project', { name, description }),

  getProjects: () =>
    invoke<Project[]>('get_projects'),

  getProjectsByStatus: (status: string) =>
    invoke<Project[]>('get_projects_by_status', { status }),

  updateProjectStatus: (id: string, status: string) =>
    invoke<void>('update_project_status', { id, status }),

  deleteProject: (id: string) =>
    invoke<void>('delete_project', { id }),

  createTask: (projectId: string, title: string, description: string, priority: string, dueDate: string, dueTime: string | null) =>
    invoke<Task>('create_task', { projectId, title, description, priority, dueDate, dueTime }),

  getTasks: (projectId: string) =>
    invoke<Task[]>('get_tasks', { projectId }),

  moveTask: (taskId: string, newStatus: string) =>
    invoke<void>('move_task', { taskId, newStatus }),

  deleteTask: (id: string) =>
    invoke<void>('delete_task', { id }),

  updateTask: (taskId: string, title: string, description: string, priority: string, dueDate: string, dueTime: string | null) =>
    invoke<void>('update_task', { taskId, title, description, priority, dueDate, dueTime }),

  getAllTasks: () =>
    invoke<Task[]>('get_all_tasks'),

  getAllTasksWithProjects: () =>
    invoke<TaskWithProject[]>('get_all_tasks_with_projects'),
};
