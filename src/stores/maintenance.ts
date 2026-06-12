import { create } from 'zustand';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority, MaintenanceRecord, MaintenanceType, WorkOrderLog } from '../types';

interface MaintenanceStore {
  workOrders: WorkOrder[];
  workOrderLogs: WorkOrderLog[];
  maintenanceRecords: MaintenanceRecord[];
  selectedWorkOrder: WorkOrder | null;
  fetchWorkOrders: () => Promise<void>;
  fetchMaintenanceRecords: () => Promise<void>;
  createWorkOrder: (data: Omit<WorkOrder, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateWorkOrder: (id: string, data: Partial<WorkOrder>) => Promise<void>;
  changeWorkOrderStatus: (id: string, status: WorkOrderStatus) => Promise<void>;
  assignWorkOrder: (id: string, assigneeId: string) => Promise<void>;
  addWorkOrderLog: (data: Omit<WorkOrderLog, 'id' | 'created_at'>) => Promise<void>;
  createMaintenanceRecord: (data: Omit<MaintenanceRecord, 'id' | 'created_at'>) => Promise<void>;
  setSelectedWorkOrder: (workOrder: WorkOrder | null) => void;
  getWorkOrdersByStatus: (status: WorkOrderStatus) => WorkOrder[];
}

const mockWorkOrders: WorkOrder[] = [
  {
    id: 'WO001',
    exception_id: 'E001',
    equipment_id: '3',
    title: '旋转木马马匹装饰加固',
    description: '第3号马匹装饰松动，需要进行加固处理',
    assignee_id: '2',
    status: 'processing',
    priority: 'low',
    created_at: '2024-01-14',
    updated_at: '2024-01-14',
  },
  {
    id: 'WO002',
    exception_id: 'E002',
    equipment_id: '4',
    title: '激流勇进电机维修',
    description: '提升系统电机异常发热，需要更换电机轴承',
    assignee_id: '2',
    status: 'pending',
    priority: 'urgent',
    created_at: '2024-01-13',
    updated_at: '2024-01-13',
  },
  {
    id: 'WO003',
    exception_id: 'E003',
    equipment_id: '1',
    title: '过山车安全带更换',
    description: '第2节车厢安全带卡扣磨损严重，需更换整套安全带组件',
    assignee_id: '2',
    status: 'completed',
    priority: 'high',
    created_at: '2024-01-10',
    updated_at: '2024-01-12',
  },
];

const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'MR001',
    equipment_id: '1',
    type: 'routine',
    performed_by: '上海特种设备维修公司',
    start_date: '2024-01-01',
    end_date: '2024-01-03',
    cost: 50000,
    description: '年度例行保养，包括润滑、紧固、检测等',
    created_at: '2024-01-03',
  },
  {
    id: 'MR002',
    equipment_id: '2',
    type: 'overhaul',
    performed_by: '原厂技术团队',
    start_date: '2023-12-15',
    end_date: '2023-12-28',
    cost: 150000,
    description: '设备大修，更换主要部件',
    created_at: '2023-12-28',
  },
];

export const useMaintenanceStore = create<MaintenanceStore>((set, get) => ({
  workOrders: [],
  workOrderLogs: [],
  maintenanceRecords: [],
  selectedWorkOrder: null,

  fetchWorkOrders: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ workOrders: mockWorkOrders });
  },

  fetchMaintenanceRecords: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ maintenanceRecords: mockMaintenanceRecords });
  },

  createWorkOrder: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newWorkOrder: WorkOrder = {
      ...data,
      id: `WO${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ workOrders: [...state.workOrders, newWorkOrder] }));
  },

  updateWorkOrder: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({
      workOrders: state.workOrders.map(wo =>
        wo.id === id ? { ...wo, ...data, updated_at: new Date().toISOString().split('T')[0] } : wo
      ),
    }));
  },

  changeWorkOrderStatus: async (id, status) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({
      workOrders: state.workOrders.map(wo =>
        wo.id === id ? { ...wo, status, updated_at: new Date().toISOString().split('T')[0] } : wo
      ),
    }));
  },

  assignWorkOrder: async (id, assigneeId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({
      workOrders: state.workOrders.map(wo =>
        wo.id === id ? { ...wo, assignee_id: assigneeId, updated_at: new Date().toISOString().split('T')[0] } : wo
      ),
    }));
  },

  addWorkOrderLog: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newLog: WorkOrderLog = {
      ...data,
      id: `WL${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ workOrderLogs: [...state.workOrderLogs, newLog] }));
  },

  createMaintenanceRecord: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newRecord: MaintenanceRecord = {
      ...data,
      id: `MR${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ maintenanceRecords: [...state.maintenanceRecords, newRecord] }));
  },

  setSelectedWorkOrder: (workOrder) => {
    set({ selectedWorkOrder: workOrder });
  },

  getWorkOrdersByStatus: (status) => {
    return get().workOrders.filter(wo => wo.status === status);
  },
}));
