import { create } from 'zustand';
import { SparePart, SparePartRequest, SparePartRequestStatus } from '../types';

interface SparePartsStore {
  spareParts: SparePart[];
  requests: SparePartRequest[];
  selectedSparePart: SparePart | null;
  fetchSpareParts: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  createSparePart: (data: Omit<SparePart, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSparePart: (id: string, data: Partial<SparePart>) => Promise<void>;
  createRequest: (data: { spare_part_id: string; requester_id: string; quantity: number; reason: string }) => Promise<{ success: boolean; message: string }>;
  approveRequest: (id: string, approved: boolean) => Promise<void>;
  issueRequest: (id: string) => Promise<{ success: boolean; message: string }>;
  setSelectedSparePart: (sparePart: SparePart | null) => void;
  getLowStockParts: () => SparePart[];
  getRequestsByStatus: (status: SparePartRequestStatus) => SparePartRequest[];
}

const mockSpareParts: SparePart[] = [
  {
    id: 'SP001',
    name: '电机轴承',
    code: 'SP-001',
    specification: '6205-2RS',
    unit: '个',
    quantity: 25,
    min_stock: 10,
    location: '仓库A区-货架1',
    created_at: '2024-01-01',
    updated_at: '2024-01-10',
  },
  {
    id: 'SP002',
    name: '安全带卡扣',
    code: 'SP-002',
    specification: 'TS-001',
    unit: '套',
    quantity: 5,
    min_stock: 15,
    location: '仓库A区-货架2',
    created_at: '2024-01-01',
    updated_at: '2024-01-12',
  },
  {
    id: 'SP003',
    name: '液压油',
    code: 'SP-003',
    specification: 'ISO VG46',
    unit: '桶',
    quantity: 15,
    min_stock: 8,
    location: '仓库B区-货架1',
    created_at: '2024-01-01',
    updated_at: '2024-01-05',
  },
  {
    id: 'SP004',
    name: '减速齿轮箱',
    code: 'SP-004',
    specification: 'GB-200',
    unit: '台',
    quantity: 2,
    min_stock: 3,
    location: '仓库B区-货架2',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

const mockRequests: SparePartRequest[] = [
  {
    id: 'SPR001',
    spare_part_id: 'SP002',
    requester_id: '2',
    quantity: 10,
    reason: '过山车安全带更换',
    status: 'approved',
    approved_by: '1',
    created_at: '2024-01-10',
    updated_at: '2024-01-11',
  },
  {
    id: 'SPR002',
    spare_part_id: 'SP001',
    requester_id: '2',
    quantity: 5,
    reason: '激流勇进电机维修',
    status: 'pending',
    approved_by: null,
    created_at: '2024-01-14',
    updated_at: '2024-01-14',
  },
];

export const useSparePartsStore = create<SparePartsStore>((set, get) => ({
  spareParts: [],
  requests: [],
  selectedSparePart: null,

  fetchSpareParts: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ spareParts: mockSpareParts });
  },

  fetchRequests: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ requests: mockRequests });
  },

  createSparePart: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newSparePart: SparePart = {
      ...data,
      id: `SP${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ spareParts: [...state.spareParts, newSparePart] }));
  },

  updateSparePart: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({
      spareParts: state.spareParts.map(sp =>
        sp.id === id ? { ...sp, ...data, updated_at: new Date().toISOString().split('T')[0] } : sp
      ),
    }));
  },

  createRequest: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const sparePart = get().spareParts.find(sp => sp.id === data.spare_part_id);
    if (!sparePart) {
      return { success: false, message: '备件不存在' };
    }
    if (data.quantity > sparePart.quantity) {
      return { success: false, message: `申请数量超过库存（当前库存: ${sparePart.quantity} ${sparePart.unit}）` };
    }
    const newRequest: SparePartRequest = {
      ...data,
      id: `SPR${Date.now()}`,
      status: 'pending',
      approved_by: null,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ requests: [...state.requests, newRequest] }));
    return { success: true, message: '申请已提交' };
  },

  approveRequest: async (id, approved) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({
      requests: state.requests.map(r =>
        r.id === id ? { ...r, status: approved ? 'approved' : 'canceled', approved_by: '1', updated_at: new Date().toISOString().split('T')[0] } : r
      ),
    }));
  },

  issueRequest: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const request = get().requests.find(r => r.id === id);
    if (!request) {
      return { success: false, message: '申请不存在' };
    }
    const sparePart = get().spareParts.find(sp => sp.id === request.spare_part_id);
    if (!sparePart) {
      return { success: false, message: '备件不存在' };
    }
    if (request.quantity > sparePart.quantity) {
      return { success: false, message: `库存不足，无法发放（当前库存: ${sparePart.quantity} ${sparePart.unit}，申请数量: ${request.quantity} ${sparePart.unit}）` };
    }
    set(state => ({
      requests: state.requests.map(r =>
        r.id === id ? { ...r, status: 'issued', updated_at: new Date().toISOString().split('T')[0] } : r
      ),
      spareParts: state.spareParts.map(sp =>
        sp.id === request.spare_part_id ? { ...sp, quantity: sp.quantity - request.quantity, updated_at: new Date().toISOString().split('T')[0] } : sp
      ),
    }));
    return { success: true, message: '发放成功' };
  },

  setSelectedSparePart: (sparePart) => {
    set({ selectedSparePart: sparePart });
  },

  getLowStockParts: () => {
    return get().spareParts.filter(sp => sp.quantity <= sp.min_stock);
  },

  getRequestsByStatus: (status) => {
    return get().requests.filter(r => r.status === status);
  },
}));