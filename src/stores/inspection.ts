import { create } from 'zustand';
import { InspectionRoute, InspectionTask, InspectionRecord, PeriodType, TaskStatus } from '../types';

interface InspectionStore {
  routes: InspectionRoute[];
  tasks: InspectionTask[];
  records: InspectionRecord[];
  selectedRoute: InspectionRoute | null;
  fetchRoutes: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  createRoute: (data: Omit<InspectionRoute, 'id' | 'created_at'>) => Promise<void>;
  updateRoute: (id: string, data: Partial<InspectionRoute>) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  generateTasks: (routeId: string, date: string) => Promise<void>;
  executeTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string, record: Omit<InspectionRecord, 'id' | 'created_at'>) => Promise<void>;
  setSelectedRoute: (route: InspectionRoute | null) => void;
  getTasksByStatus: (status: TaskStatus) => InspectionTask[];
}

const mockRoutes: InspectionRoute[] = [
  {
    id: 'R001',
    name: '每日例行巡检路线',
    description: '覆盖所有核心设备的每日巡检路线',
    equipment_ids: ['1', '2', '3', '5', '6'],
    period_type: 'daily',
    period_value: 1,
    created_by: '1',
    created_at: '2024-01-01',
  },
  {
    id: 'R002',
    name: '周度深度检查路线',
    description: '每周对重点设备进行深度检查',
    equipment_ids: ['1', '2', '4'],
    period_type: 'weekly',
    period_value: 1,
    created_by: '1',
    created_at: '2024-01-01',
  },
  {
    id: 'R003',
    name: '月度全面检查路线',
    description: '每月对所有设备进行全面检查',
    equipment_ids: ['1', '2', '3', '4', '5', '6'],
    period_type: 'monthly',
    period_value: 1,
    created_by: '1',
    created_at: '2024-01-01',
  },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const mockTasks: InspectionTask[] = [
  { id: 'T001', route_id: 'R001', equipment_id: '1', scheduled_date: today, status: 'pending', assigned_to: '2', created_at: today },
  { id: 'T002', route_id: 'R001', equipment_id: '2', scheduled_date: today, status: 'pending', assigned_to: '2', created_at: today },
  { id: 'T003', route_id: 'R001', equipment_id: '3', scheduled_date: today, status: 'executing', assigned_to: '2', created_at: today },
  { id: 'T004', route_id: 'R001', equipment_id: '5', scheduled_date: today, status: 'completed', assigned_to: '2', created_at: today },
  { id: 'T005', route_id: 'R001', equipment_id: '6', scheduled_date: today, status: 'pending', assigned_to: '2', created_at: today },
  { id: 'T006', route_id: 'R002', equipment_id: '1', scheduled_date: today, status: 'pending', assigned_to: '2', created_at: today },
  { id: 'T007', route_id: 'R001', equipment_id: '4', scheduled_date: yesterday, status: 'overdue', assigned_to: '2', created_at: yesterday },
];

const mockRecords: InspectionRecord[] = [
  {
    id: 'IR001',
    task_id: 'T004',
    equipment_id: '5',
    inspector_id: '2',
    inspection_time: `${today} 09:30:00`,
    status: 'normal',
    notes: '设备运行正常，各项指标良好',
    photos: [],
    created_at: today,
  },
];

export const useInspectionStore = create<InspectionStore>((set, get) => ({
  routes: [],
  tasks: [],
  records: mockRecords,
  selectedRoute: null,

  fetchRoutes: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ routes: mockRoutes });
  },

  fetchTasks: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ tasks: mockTasks });
  },

  createRoute: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newRoute: InspectionRoute = {
      ...data,
      id: `R${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ routes: [...state.routes, newRoute] }));
  },

  updateRoute: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({
      routes: state.routes.map(r =>
        r.id === id ? { ...r, ...data } : r
      ),
    }));
  },

  deleteRoute: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({ routes: state.routes.filter(r => r.id !== id) }));
  },

  generateTasks: async (routeId, date) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const route = get().routes.find(r => r.id === routeId);
    if (route) {
      const newTasks: InspectionTask[] = route.equipment_ids.map(eqId => ({
        id: `T${Date.now()}-${eqId}`,
        route_id: routeId,
        equipment_id: eqId,
        scheduled_date: date,
        status: 'pending',
        assigned_to: '2',
        created_at: new Date().toISOString().split('T')[0],
      }));
      set(state => ({ tasks: [...state.tasks, ...newTasks] }));
    }
  },

  executeTask: async (taskId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({
      tasks: state.tasks.map(t =>
        t.id === taskId ? { ...t, status: 'executing' as TaskStatus } : t
      ),
    }));
  },

  completeTask: async (taskId, record) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newRecord: InspectionRecord = {
      ...record,
      id: `IR${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({
      tasks: state.tasks.map(t =>
        t.id === taskId ? { ...t, status: 'completed' as TaskStatus } : t
      ),
      records: [...state.records, newRecord],
    }));
  },

  setSelectedRoute: (route) => {
    set({ selectedRoute: route });
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter(t => t.status === status);
  },
}));
