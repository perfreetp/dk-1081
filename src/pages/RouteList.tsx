import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Play, Calendar, Map, ChevronRight, Clock, CheckCircle, Camera, FileText, X, Save, AlertTriangle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useInspectionStore } from '../stores/inspection';
import { useEquipmentStore } from '../stores/equipment';
import { useAuthStore } from '../stores/auth';
import { InspectionRoute, InspectionTask, PeriodType, TaskStatus } from '../types';

interface RouteListProps {
  onNavigate: (page: string) => void;
}

const periodLabels: Record<PeriodType, string> = {
  daily: '每日',
  weekly: '每周',
  monthly: '每月',
};

const taskStatusColors: Record<TaskStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  executing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
};

const taskStatusLabels: Record<TaskStatus, string> = {
  pending: '待执行',
  executing: '执行中',
  completed: '已完成',
  overdue: '已逾期',
};

export default function RouteList({ onNavigate }: RouteListProps) {
  const { routes, tasks, fetchRoutes, fetchTasks, deleteRoute, generateTasks, executeTask, completeTask } = useInspectionStore();
  const { equipments, fetchEquipments } = useEquipmentStore();
  const { hasPermission, user } = useAuthStore();
  const [selectedRoute, setSelectedRoute] = useState<InspectionRoute | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InspectionTask | null>(null);
  const [inspectForm, setInspectForm] = useState({
    status: 'normal',
    notes: '',
    photos: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoutes();
    fetchEquipments();
    fetchTasks();
  }, []);

  const getRouteEquipmentNames = (equipmentIds: string[]) => {
    return equipmentIds.map(id => equipments.find(e => e.id === id)?.name).filter(Boolean).join(', ');
  };

  const handleGenerateTasks = async () => {
    if (selectedRoute) {
      setLoading(true);
      try {
        await generateTasks(selectedRoute.id, new Date().toISOString().split('T')[0]);
        await fetchTasks();
        setShowGenerateModal(false);
        setSelectedRoute(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartInspect = async (task: InspectionTask) => {
    setLoading(true);
    try {
      await executeTask(task.id);
      await fetchTasks();
      setSelectedTask(task);
      setInspectForm({ status: 'normal', notes: '', photos: [] });
      setShowInspectModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteInspect = async () => {
    if (!selectedTask || !user) return;
    setLoading(true);
    try {
      await completeTask(selectedTask.id, {
        task_id: selectedTask.id,
        equipment_id: selectedTask.equipment_id,
        inspector_id: user.id,
        inspection_time: new Date().toISOString(),
        status: inspectForm.status as 'normal' | 'abnormal',
        notes: inspectForm.notes,
        photos: inspectForm.photos,
      });
      await fetchTasks();
      setShowInspectModal(false);
      setSelectedTask(null);
    } finally {
      setLoading(false);
    }
  };

  const canEditRoutes = hasPermission('edit_routes');
  const canExecute = hasPermission('execute_inspection');

  const todayTasks = tasks.filter(t => t.scheduled_date === new Date().toISOString().split('T')[0] || t.status === 'overdue');

  return (
    <Layout currentPage="routes" onNavigate={onNavigate} title="巡检路线" subtitle="管理巡检路线与周期任务">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">共 {routes.length} 条巡检路线 | 今日任务 {todayTasks.length} 项</p>
        </div>
        {canEditRoutes && (
          <button className="btn btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            新建路线
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
              {canExecute && (
                <button className="flex-1 btn btn-primary text-sm flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" />
                  开始巡检
                </button>
              )}
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
              {canEditRoutes && (
                <>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-danger hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">今日巡检任务</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">待执行: {todayTasks.filter(t => t.status === 'pending').length}</span>
            <span className="text-blue-600">执行中: {todayTasks.filter(t => t.status === 'executing').length}</span>
            <span className="text-green-600">已完成: {todayTasks.filter(t => t.status === 'completed').length}</span>
            <span className="text-red-600">逾期: {todayTasks.filter(t => t.status === 'overdue').length}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">任务编号</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">设备名称</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">路线名称</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">计划日期</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">状态</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {todayTasks.map(task => {
                const equipment = equipments.find(e => e.id === task.equipment_id);
                const route = routes.find(r => r.id === task.route_id);
                return (
                  <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{task.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{equipment?.name || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{route?.name || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{task.scheduled_date}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${taskStatusColors[task.status]}`}>
                        {taskStatusLabels[task.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {task.status === 'pending' && canExecute && (
                        <button
                          onClick={() => handleStartInspect(task)}
                          disabled={loading}
                          className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 disabled:opacity-50"
                        >
                          开始巡检 <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                      {task.status === 'executing' && canExecute && (
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setInspectForm({ status: 'normal', notes: '', photos: [] });
                            setShowInspectModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          继续巡检 <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                      {task.status === 'completed' && (
                        <span className="text-green-600 text-sm flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          已完成
                        </span>
                      )}
                      {task.status === 'overdue' && canExecute && (
                        <button
                          onClick={() => handleStartInspect(task)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 disabled:opacity-50"
                        >
                          立即执行 <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {todayTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            暂无今日巡检任务，请先生成任务
          </div>
        )}
      </div>

      {showGenerateModal && selectedRoute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowGenerateModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-800">生成巡检任务</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
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
              <div className="p-4 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-700">
                  将为 <span className="font-bold">{selectedRoute.equipment_ids.length} 台设备</span> 生成巡检任务
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 btn btn-secondary" onClick={() => setShowGenerateModal(false)}>
                取消
              </button>
              <button 
                className="flex-1 btn btn-primary" 
                onClick={handleGenerateTasks}
                disabled={loading}
              >
                {loading ? '生成中...' : '确认生成'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInspectModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowInspectModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-800">巡检记录</h3>
              <button onClick={() => setShowInspectModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-500 mb-1">设备信息</p>
              <p className="font-medium text-gray-800">{equipments.find(e => e.id === selectedTask.equipment_id)?.name}</p>
              <p className="text-sm text-gray-500">{equipments.find(e => e.id === selectedTask.equipment_id)?.location}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">巡检结果 *</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setInspectForm({ ...inspectForm, status: 'normal' })}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      inspectForm.status === 'normal'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">正常</p>
                  </button>
                  <button
                    onClick={() => setInspectForm({ ...inspectForm, status: 'abnormal' })}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      inspectForm.status === 'abnormal'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">异常</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">巡检备注</label>
                <textarea
                  rows={3}
                  value={inspectForm.notes}
                  onChange={(e) => setInspectForm({ ...inspectForm, notes: e.target.value })}
                  placeholder="请填写巡检情况说明..."
                  className="form-textarea"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">拍照留痕</label>
                <div className="flex items-center gap-2">
                  <button className="btn btn-secondary flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    添加照片
                  </button>
                  <span className="text-sm text-gray-500">{inspectForm.photos.length} 张照片</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 btn btn-secondary" onClick={() => setShowInspectModal(false)}>
                取消
              </button>
              <button 
                className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                onClick={handleCompleteInspect}
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                {loading ? '提交中...' : '提交巡检'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}