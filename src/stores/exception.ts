import { create } from 'zustand';
import { Exception, ExceptionLevel, ExceptionStatus } from '../types';
import { useEquipmentStore } from './equipment';

interface ExceptionStore {
  exceptions: Exception[];
  selectedException: Exception | null;
  fetchExceptions: () => Promise<void>;
  reportException: (data: Omit<Exception, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateException: (id: string, data: Partial<Exception>) => Promise<void>;
  requestStop: (id: string) => Promise<void>;
  approveStop: (id: string, approved: boolean) => Promise<void>;
  resolveException: (id: string) => Promise<void>;
  verifyAndClose: (id: string, equipmentId: string) => Promise<void>;
  closeException: (id: string) => Promise<void>;
  setSelectedException: (exception: Exception | null) => void;
  getExceptionsByStatus: (status: ExceptionStatus) => Exception[];
}

const mockExceptions: Exception[] = [
  {
    id: 'E001',
    equipment_id: '3',
    reporter_id: '2',
    level: 'minor',
    description: '旋转木马第3号马匹装饰松动，需要加固',
    photos: [],
    status: 'processing',
    stop_requested: false,
    stop_approved: false,
    created_at: '2024-01-14',
    updated_at: '2024-01-14',
  },
  {
    id: 'E002',
    equipment_id: '4',
    reporter_id: '2',
    level: 'critical',
    description: '激流勇进提升系统电机异常发热，存在安全隐患',
    photos: [],
    status: 'reported',
    stop_requested: true,
    stop_approved: true,
    created_at: '2024-01-13',
    updated_at: '2024-01-13',
  },
  {
    id: 'E003',
    equipment_id: '1',
    reporter_id: '2',
    level: 'major',
    description: '过山车第2节车厢安全带卡扣磨损严重，需要更换',
    photos: [],
    status: 'resolved',
    stop_requested: false,
    stop_approved: false,
    created_at: '2024-01-10',
    updated_at: '2024-01-12',
  },
];

export const useExceptionStore = create<ExceptionStore>((set, get) => ({
  exceptions: [],
  selectedException: null,

  fetchExceptions: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ exceptions: mockExceptions });
  },

  reportException: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newException: Exception = {
      ...data,
      id: `E${Date.now()}`,
      status: 'reported',
      stop_requested: false,
      stop_approved: false,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ exceptions: [...state.exceptions, newException] }));
    
    useEquipmentStore.getState().updateEquipmentStatus(data.equipment_id, 'abnormal');
  },

  updateException: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({
      exceptions: state.exceptions.map(e =>
        e.id === id ? { ...e, ...data, updated_at: new Date().toISOString().split('T')[0] } : e
      ),
    }));
  },

  requestStop: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const exception = get().exceptions.find(e => e.id === id);
    set(state => ({
      exceptions: state.exceptions.map(e =>
        e.id === id ? { ...e, stop_requested: true, updated_at: new Date().toISOString().split('T')[0] } : e
      ),
    }));
  },

  approveStop: async (id, approved) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const exception = get().exceptions.find(e => e.id === id);
    if (approved && exception) {
      useEquipmentStore.getState().updateEquipmentStatus(exception.equipment_id, 'stopped');
    }
    set(state => ({
      exceptions: state.exceptions.map(e =>
        e.id === id ? { ...e, stop_approved: approved, updated_at: new Date().toISOString().split('T')[0] } : e
      ),
    }));
  },

  resolveException: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({
      exceptions: state.exceptions.map(e =>
        e.id === id ? { ...e, status: 'resolved' as ExceptionStatus, updated_at: new Date().toISOString().split('T')[0] } : e
      ),
    }));
  },

  verifyAndClose: async (id, equipmentId) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({
      exceptions: state.exceptions.map(e =>
        e.id === id ? { ...e, status: 'closed' as ExceptionStatus, updated_at: new Date().toISOString().split('T')[0] } : e
      ),
    }));
    useEquipmentStore.getState().updateEquipmentStatus(equipmentId, 'normal');
  },

  closeException: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({
      exceptions: state.exceptions.map(e =>
        e.id === id ? { ...e, status: 'closed' as ExceptionStatus, updated_at: new Date().toISOString().split('T')[0] } : e
      ),
    }));
  },

  setSelectedException: (exception) => {
    set({ selectedException: exception });
  },

  getExceptionsByStatus: (status) => {
    return get().exceptions.filter(e => e.status === status);
  },
}));