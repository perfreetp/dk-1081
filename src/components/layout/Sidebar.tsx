import { LayoutDashboard, Database, Route, AlertTriangle, Wrench, Package, BarChart3, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { UserRole } from '../../types';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems: Record<UserRole, { id: string; label: string; icon: typeof LayoutDashboard }[]> = {
  equipment_supervisor: [
    { id: 'dashboard', label: '今日看板', icon: LayoutDashboard },
    { id: 'equipment', label: '设备档案', icon: Database },
    { id: 'routes', label: '巡检路线', icon: Route },
    { id: 'exceptions', label: '异常处理', icon: AlertTriangle },
    { id: 'maintenance', label: '维修计划', icon: Wrench },
    { id: 'spare-parts', label: '备件领用', icon: Package },
    { id: 'statistics', label: '统计分析', icon: BarChart3 },
  ],
  maintainer: [
    { id: 'dashboard', label: '今日看板', icon: LayoutDashboard },
    { id: 'equipment', label: '设备档案', icon: Database },
    { id: 'routes', label: '巡检路线', icon: Route },
    { id: 'exceptions', label: '异常处理', icon: AlertTriangle },
    { id: 'maintenance', label: '维修计划', icon: Wrench },
    { id: 'spare-parts', label: '备件领用', icon: Package },
    { id: 'statistics', label: '统计分析', icon: BarChart3 },
  ],
  shift_manager: [
    { id: 'dashboard', label: '今日看板', icon: LayoutDashboard },
    { id: 'equipment', label: '设备档案', icon: Database },
    { id: 'routes', label: '巡检路线', icon: Route },
    { id: 'exceptions', label: '异常处理', icon: AlertTriangle },
    { id: 'maintenance', label: '维修计划', icon: Wrench },
    { id: 'spare-parts', label: '备件领用', icon: Package },
    { id: 'statistics', label: '统计分析', icon: BarChart3 },
  ],
};

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuthStore();
  
  if (!user) return null;

  const items = menuItems[user.role];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-800">设备巡检系统</h1>
            <p className="text-xs text-gray-500">游乐园管理平台</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map(item => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500">
              {user.role === 'equipment_supervisor' && '设备主管'}
              {user.role === 'maintainer' && '维修员'}
              {user.role === 'shift_manager' && '值班经理'}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
