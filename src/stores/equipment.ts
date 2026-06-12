import { create } from 'zustand';
import { Equipment, EquipmentStatus } from '../types';

interface EquipmentStore {
  equipments: Equipment[];
  selectedEquipment: Equipment | null;
  fetchEquipments: () => Promise<void>;
  getEquipmentById: (id: string) => Equipment | undefined;
  createEquipment: (data: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEquipment: (id: string, data: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  setSelectedEquipment: (equipment: Equipment | null) => void;
  updateEquipmentStatus: (id: string, status: EquipmentStatus) => void;
}

const mockEquipments: Equipment[] = [
  {
    id: '1',
    name: '过山车',
    code: 'EQ001',
    model: 'RC-2020',
    manufacturer: '德国B&M公司',
    department_id: 'D001',
    location: '欢乐区A区',
    status: 'normal',
    installed_date: '2020-06-15',
    operation_hours: 12580,
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EQ001',
    created_at: '2020-06-15',
    updated_at: '2024-01-15',
  },
  {
    id: '2',
    name: '摩天轮',
    code: 'EQ002',
    model: 'FW-50M',
    manufacturer: '上海奇乐集团',
    department_id: 'D001',
    location: '观光区B区',
    status: 'normal',
    installed_date: '2018-08-20',
    operation_hours: 28650,
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EQ002',
    created_at: '2018-08-20',
    updated_at: '2024-01-15',
  },
  {
    id: '3',
    name: '旋转木马',
    code: 'EQ003',
    model: 'CM-12A',
    manufacturer: '广州金马游乐',
    department_id: 'D002',
    location: '儿童区C区',
    status: 'abnormal',
    installed_date: '2019-03-10',
    operation_hours: 15230,
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EQ003',
    created_at: '2019-03-10',
    updated_at: '2024-01-15',
  },
  {
    id: '4',
    name: '激流勇进',
    code: 'EQ004',
    model: 'RR-88',
    manufacturer: '美国Intamin公司',
    department_id: 'D001',
    location: '水上游乐区D区',
    status: 'stopped',
    installed_date: '2021-04-01',
    operation_hours: 8920,
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EQ004',
    created_at: '2021-04-01',
    updated_at: '2024-01-15',
  },
  {
    id: '5',
    name: '大摆锤',
    code: 'EQ005',
    model: 'SW-360',
    manufacturer: '中山金龙游乐',
    department_id: 'D001',
    location: '刺激区E区',
    status: 'normal',
    installed_date: '2022-07-15',
    operation_hours: 5680,
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EQ005',
    created_at: '2022-07-15',
    updated_at: '2024-01-15',
  },
  {
    id: '6',
    name: '碰碰车',
    code: 'EQ006',
    model: 'BC-24',
    manufacturer: '深圳智趣游乐',
    department_id: 'D002',
    location: '儿童区C区',
    status: 'normal',
    installed_date: '2020-09-01',
    operation_hours: 18920,
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EQ006',
    created_at: '2020-09-01',
    updated_at: '2024-01-15',
  },
];

export const useEquipmentStore = create<EquipmentStore>((set, get) => ({
  equipments: [],
  selectedEquipment: null,

  fetchEquipments: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({ equipments: mockEquipments });
  },

  getEquipmentById: (id) => {
    return get().equipments.find(e => e.id === id);
  },

  createEquipment: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newEquipment: Equipment = {
      ...data,
      id: `EQ${Date.now()}`,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.code}`,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ equipments: [...state.equipments, newEquipment] }));
  },

  updateEquipment: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({
      equipments: state.equipments.map(e =>
        e.id === id ? { ...e, ...data, updated_at: new Date().toISOString().split('T')[0] } : e
      ),
    }));
  },

  deleteEquipment: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    set(state => ({ equipments: state.equipments.filter(e => e.id !== id) }));
  },

  setSelectedEquipment: (equipment) => {
    set({ selectedEquipment: equipment });
  },

  updateEquipmentStatus: (id, status) => {
    set(state => ({
      equipments: state.equipments.map(e =>
        e.id === id ? { ...e, status, updated_at: new Date().toISOString().split('T')[0] } : e
      ),
    }));
  },
}));
