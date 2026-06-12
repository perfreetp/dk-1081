import { useEffect, useState } from 'react';
import { Wrench, Search, Filter, Plus, Calendar, Clock, User, ChevronRight, CheckCircle, AlertCircle, X, Save } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useMaintenanceStore } from '../stores/maintenance';
import { useEquipmentStore } from '../stores/equipment';
import { useAuthStore } from '../stores/auth';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from '../types';

interface MaintenanceListProps {
  onNavigate: (page: string) => void;
}

const statusColors: Record<WorkOrderStatus, string> = {
  pending: 'bg-blue-100 text-blue-800',
  accepted: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  verified: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<WorkOrderStatus, string> = {
  pending: '待分配',
  accepted: '已接单',
  processing: '处理中',
  completed: '已完成',
  verified: '已验收',
};

const priorityColors: Record<WorkOrderPriority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const priorityLabels: Record<WorkOrderPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

export default function MaintenanceList({ onNavigate }: MaintenanceListProps) {
  const { workOrders, fetchWorkOrders, changeWorkOrderStatus, assignWorkOrder, createWorkOrder } = useMaintenanceStore();
  const { equipments, fetchEquipments } = useEquipmentStore();
  const { hasPermission, user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>('all');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    equipment_id: '',
    title: '',
    description: '',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkOrders();
    fetchEquipments();
  }, []);

  const filteredWorkOrders = workOrders.filter(wo => {
    const equipment = equipments.find(e => e.id === wo.equipment_id);
    const matchesSearch = wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         wo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         equipment?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAccept = async (id: string) => {
    setLoading(true);
    try {
      await changeWorkOrderStatus(id, 'accepted');
      await fetchWorkOrders();
    } finally {
      setLoading(false);
    }
  };

  const handleStartProcess = async (id: string) => {
    setLoading(true);
    try {
      await changeWorkOrderStatus(id, 'processing');
      await fetchWorkOrders();
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    setLoading(true);
    try {
      await changeWorkOrderStatus(id, 'completed');
      await fetchWorkOrders();
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    setLoading(true);
    try {
      await changeWorkOrderStatus(id, 'verified');
      await fetchWorkOrders();
      setSelectedWorkOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.equipment_id || !createForm.title || !user) return;
    setLoading(true);
    try {
      await createWorkOrder({
        exception_id: '',
        equipment_id: createForm.equipment_id,
        title: createForm.title,
        description: createForm.description,
        assignee_id: '',
        status: 'pending',
        priority: createForm.priority as WorkOrderPriority,
      });
      await fetchWorkOrders();
      setShowCreateModal(false);
      setCreateForm({ equipment_id: '', title: '', description: '', priority: 'medium' });
    } finally {
      setLoading(false);
    }
  };

  const canCreate = hasPermission('create_work_order');
  const canAssign = hasPermission('assign_work_order');
  const canAccept = hasPermission('accept_work_order');
  const canProcess = hasPermission('process_work_order');
  const canVerify = hasPermission('approve_exception');

  return (
    <Layout currentPage="maintenance" onNavigate={onNavigate} title="维修计划" subtitle="管理维修工单与保养计划">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`btn flex items-center gap-2 ${showCalendar ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Calendar className="w-5 h-5" />
            保养日历
          </button>
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索工单标题、设备名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as WorkOrderStatus | 'all')}
              className="form-select w-32"
            >
              <option value="all">全部状态</option>
              <option value="pending">待分配</option>
              <option value="accepted">已接单</option>
              <option value="processing">处理中</option>
              <option value="completed">已完成</option>
              <option value="verified">已验收</option>
            </select>
          </div>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            新建工单
          </button>
        )}
      </div>

      {showCalendar && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">保养日历</h3>
          <div className="grid grid-cols-7 gap-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="text-center py-2 text-sm font-medium text-gray-500">{day}</div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const day = i + 1 - 5;
              if (day <= 0 || day > 31) return <div key={i} className="h-12"></div>;
              const hasMaintenance = [5, 12, 18, 25].includes(day);
              return (
                <div
                  key={i}
                  className={`h-12 flex flex-col items-center justify-center text-sm rounded-lg relative ${
                    hasMaintenance ? 'bg-primary-100 text-primary-800 font-medium' : 'text-gray-600'
                  }`}
                >
                  {day}
                  {hasMaintenance && (
                    <Wrench className="w-3 h-3 text-primary-600 mt-1" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary-600" />
              <span className="text-gray-600">有保养任务</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredWorkOrders.map(workOrder => {
          const equipment = equipments.find(e => e.id === workOrder.equipment_id);
          return (
            <div key={workOrder.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{workOrder.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[workOrder.priority]}`}>
                      {priorityLabels[workOrder.priority]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{workOrder.id}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[workOrder.status]}`}>
                  {statusLabels[workOrder.status]}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">{workOrder.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-gray-400" />
                  <span>{equipment?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{workOrder.assignee_id ? '李明' : '未分配'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{workOrder.created_at}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedWorkOrder(workOrder)}
                  className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  详情 <ChevronRight className="w-4 h-4" />
                </button>
                {workOrder.status === 'pending' && canAssign && (
                  <button className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm hover:bg-primary-200 transition-colors">
                    分配
                  </button>
                )}
                {workOrder.status === 'pending' && canAccept && !canAssign && (
                  <button
                    onClick={() => handleAccept(workOrder.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    接单
                  </button>
                )}
                {workOrder.status === 'accepted' && canProcess && (
                  <button
                    onClick={() => handleStartProcess(workOrder.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 transition-colors disabled:opacity-50"
                  >
                    开始处理
                  </button>
                )}
                {workOrder.status === 'processing' && canProcess && (
                  <button
                    onClick={() => handleComplete(workOrder.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    完成
                  </button>
                )}
                {workOrder.status === 'completed' && canVerify && (
                  <button
                    onClick={() => handleVerify(workOrder.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm hover:bg-primary-200 transition-colors disabled:opacity-50"
                  >
                    验收
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredWorkOrders.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          暂无维修工单
        </div>
      )}

      {selectedWorkOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedWorkOrder(null)}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800">{selectedWorkOrder.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[selectedWorkOrder.priority]}`}>
                      {priorityLabels[selectedWorkOrder.priority]}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[selectedWorkOrder.status]}`}>
                      {statusLabels[selectedWorkOrder.status]}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedWorkOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">设备名称</label>
                <p className="text-gray-800">{equipments.find(e => e.id === selectedWorkOrder.equipment_id)?.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">工单描述</label>
                <p className="text-gray-800">{selectedWorkOrder.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">创建时间</label>
                  <p className="text-gray-800">{selectedWorkOrder.created_at}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">负责人</label>
                  <p className="text-gray-800">{selectedWorkOrder.assignee_id ? '李明' : '未分配'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">关联异常</label>
                  <p className="text-gray-800">{selectedWorkOrder.exception_id || '无'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">处理日志</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">工单创建</p>
                      <p className="text-xs text-gray-500">{selectedWorkOrder.created_at} 由系统创建</p>
                    </div>
                  </div>
                  {selectedWorkOrder.status !== 'pending' && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">维修员接单</p>
                        <p className="text-xs text-yellow-600">维修员已接单开始处理</p>
                      </div>
                    </div>
                  )}
                  {selectedWorkOrder.status === 'completed' && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">维修完成</p>
                        <p className="text-xs text-green-600">已完成维修工作，等待验收</p>
                      </div>
                    </div>
                  )}
                  {selectedWorkOrder.status === 'verified' && (
                    <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-800">验收完成</p>
                        <p className="text-xs text-primary-600">工单已完成验收</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button className="flex-1 btn btn-secondary" onClick={() => setSelectedWorkOrder(null)}>
                关闭
              </button>
              {selectedWorkOrder.status === 'completed' && canVerify && (
                <button
                  onClick={() => handleVerify(selectedWorkOrder.id)}
                  disabled={loading}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {loading ? '验收中...' : '验收确认'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-800">新建维修工单</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择设备 *</label>
                <select
                  value={createForm.equipment_id}
                  onChange={(e) => setCreateForm({ ...createForm, equipment_id: e.target.value })}
                  className="form-select"
                >
                  <option value="">请选择设备</option>
                  {equipments.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">工单标题 *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="请输入工单标题"
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">优先级</label>
                <div className="flex gap-3">
                  {(['low', 'medium', 'high', 'urgent'] as WorkOrderPriority[]).map(priority => (
                    <button
                      key={priority}
                      onClick={() => setCreateForm({ ...createForm, priority })}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        createForm.priority === priority
                          ? priorityColors[priority].replace('bg-', 'border-').replace('text-', 'bg-')
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {priorityLabels[priority]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">工单描述</label>
                <textarea
                  rows={4}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="请详细描述维修内容..."
                  className="form-textarea"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                取消
              </button>
              <button
                className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                onClick={handleCreate}
                disabled={loading || !createForm.equipment_id || !createForm.title}
              >
                <Save className="w-4 h-4" />
                {loading ? '创建中...' : '创建工单'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}