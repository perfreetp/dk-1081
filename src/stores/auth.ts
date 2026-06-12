import { create } from 'zustand';
import { User, UserRole } from '../types';

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const mockUsers: Record<string, { password: string; user: User }> = {
  'supervisor': {
    password: '123456',
    user: {
      id: '1',
      name: '张伟',
      role: 'equipment_supervisor',
      phone: '13800138001',
      department: '设备管理部',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  },
  'maintainer': {
    password: '123456',
    user: {
      id: '2',
      name: '李明',
      role: 'maintainer',
      phone: '13800138002',
      department: '维修班组',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  },
  'manager': {
    password: '123456',
    user: {
      id: '3',
      name: '王强',
      role: 'shift_manager',
      phone: '13800138003',
      department: '运营管理部',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  },
};

const permissionMatrix: Record<UserRole, string[]> = {
  equipment_supervisor: [
    'view_equipment', 'edit_equipment',
    'view_routes', 'edit_routes',
    'view_exceptions', 'report_exception', 'approve_exception',
    'view_work_orders', 'create_work_order', 'assign_work_order',
    'view_spare_parts', 'approve_spare_request',
    'view_statistics', 'export_statistics',
  ],
  maintainer: [
    'view_equipment',
    'view_routes', 'execute_inspection',
    'view_exceptions', 'report_exception',
    'view_work_orders', 'accept_work_order', 'process_work_order',
    'view_spare_parts', 'request_spare_part',
    'view_statistics',
  ],
  shift_manager: [
    'view_equipment',
    'view_routes',
    'view_exceptions', 'report_exception', 'approve_exception', 'approve_stop',
    'view_work_orders', 'create_work_order',
    'view_spare_parts', 'approve_spare_request',
    'view_statistics', 'export_statistics',
    'view_shift_records', 'create_shift_record',
  ],
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoggedIn: false,

  login: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser = mockUsers[credentials.username];
    if (mockUser && mockUser.password === credentials.password) {
      set({ user: mockUser.user, isLoggedIn: true });
    } else {
      throw new Error('用户名或密码错误');
    }
  },

  logout: () => {
    set({ user: null, isLoggedIn: false });
  },

  hasPermission: (permission) => {
    const { user } = get();
    if (!user) return false;
    return permissionMatrix[user.role]?.includes(permission) || false;
  },
}));
