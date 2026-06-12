import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Play, Calendar, Map, ChevronRight, Clock } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useInspectionStore } from '../stores/inspection';
import { useEquipmentStore } from '../stores/equipment';
import { InspectionRoute, PeriodType } from '../types';

interface RouteListProps {
  onNavigate: (page: string) => void;
}

const periodLabels: Record<PeriodType, string> = {
  daily: '每日',
  weekly: '每周',
  monthly: '每月',
};

export default function RouteList({ onNavigate }: RouteListProps) {
  const { routes, fetchRoutes, deleteRoute, generateTasks } = useInspectionStore();
  const { equipments, fetchEquipments } = useEquipmentStore();
  const [selectedRoute, setSelectedRoute] = useState<InspectionRoute | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    fetchRoutes();
    fetchEquipments();
  }, []);

  const getRouteEquipmentNames = (equipmentIds: string[]) => {
    return equipmentIds.map(id => equipments.find(e => e.id === id)?.name).filter(Boolean).join(', ');
  };

  const handleGenerateTasks = async () => {
    if (selectedRoute) {
      await generateTasks(selectedRoute.id, new Date().toISOString().split('T')[0]);
      setShowGenerateModal(false);
      setSelectedRoute(null);
    }
  };

  return (
    <Layout currentPage="routes" onNavigate={onNavigate} title="巡检路线" subtitle="管理巡检路线与周期任务">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">共 {routes.length} 条巡检路线</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          新建路线
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {routes.map(route => (
          <div key={route.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{route.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{route.description}</p>
                </div>
                <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                  {periodLabels[route.period_type]}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Map className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">
                    设备数量: <span className="font-medium">{route.equipment_ids.length} 台</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">
                    周期: {periodLabels[route.period_type]} {route.period_value} 次
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="text-gray-400">覆盖设备: </span>
                  <span>{getRouteEquipmentNames(route.equipment_ids)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-gray-50 border-t border-gray-100">
              <button className="flex-1 btn btn-primary text-sm flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                开始巡检
              </button>
              <button
                onClick={() => {
                  setSelectedRoute(route);
                  setShowGenerateModal(true);
                }}
                className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                生成任务
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg">
                <Edit2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-danger hover:bg-red-50 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">今日巡检任务</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">任务编号</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">设备名称</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">路线名称</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">状态</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'T001', equipment: '过山车', route: '每日例行巡检', status: 'pending' },
                { id: 'T002', equipment: '摩天轮', route: '每日例行巡检', status: 'pending' },
                { id: 'T003', equipment: '旋转木马', route: '每日例行巡检', status: 'executing' },
                { id: 'T004', equipment: '大摆锤', route: '每日例行巡检', status: 'completed' },
              ].map(task => (
                <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800">{task.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{task.equipment}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{task.route}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      task.status === 'executing' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.status === 'pending' ? '待执行' : task.status === 'executing' ? '执行中' : '已完成'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1">
                      执行 <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showGenerateModal && selectedRoute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowGenerateModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-800 mb-4">生成巡检任务</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">路线名称</label>
                <input
                  type="text"
                  value={selectedRoute.name}
                  disabled
                  className="form-input bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">执行日期</label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="form-input"
                />
              </div>
              <div className="text-sm text-gray-600">
                将为 <span className="font-medium">{selectedRoute.equipment_ids.length} 台设备</span> 生成巡检任务
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 btn btn-secondary" onClick={() => setShowGenerateModal(false)}>
                取消
              </button>
              <button className="flex-1 btn btn-primary" onClick={handleGenerateTasks}>
                确认生成
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
