import { useEffect, useState } from 'react';
import { Plus, Search, Filter, QrCode, Edit2, Trash2, Eye, Activity, MapPin, Calendar, X, Save, AlertTriangle, Settings, Clock, Wrench } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useEquipmentStore } from '../stores/equipment';
import { useAuthStore } from '../stores/auth';
import { Equipment, EquipmentStatus } from '../types';

interface EquipmentListProps {
  onNavigate: (page: string) => void;
}

const statusColors: Record<EquipmentStatus, string> = {
  normal: 'bg-green-100 text-green-800',
  abnormal: 'bg-yellow-100 text-yellow-800',
  stopped: 'bg-red-100 text-red-800',
};

const statusLabels: Record<EquipmentStatus, string> = {
  normal: '正常运行',
  abnormal: '异常',
  stopped: '停运',
};

type ModalMode = 'none' | 'detail' | 'add' | 'edit' | 'delete';

export default function EquipmentList({ onNavigate }: EquipmentListProps) {
  const { equipments, fetchEquipments, createEquipment, updateEquipment, deleteEquipment } = useEquipmentStore();
  const { hasPermission } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'all'>('all');
  const [modalMode, setModalMode] = useState<ModalMode>('none');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    model: '',
    manufacturer: '',
    department_id: 'D001',
    location: '',
    status: 'normal' as EquipmentStatus,
    installed_date: '',
    operation_hours: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEquipments();
  }, []);

  const filteredEquipments = equipments.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openAddModal = () => {
    setFormData({
      name: '',
      code: '',
      model: '',
      manufacturer: '',
      department_id: 'D001',
      location: '',
      status: 'normal',
      installed_date: new Date().toISOString().split('T')[0],
      operation_hours: 0,
    });
    setModalMode('add');
  };

  const openEditModal = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setFormData({
      name: equipment.name,
      code: equipment.code,
      model: equipment.model,
      manufacturer: equipment.manufacturer,
      department_id: equipment.department_id,
      location: equipment.location,
      status: equipment.status,
      installed_date: equipment.installed_date,
      operation_hours: equipment.operation_hours,
    });
    setModalMode('edit');
  };

  const openDetailModal = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setModalMode('detail');
  };

  const openDeleteModal = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setModalMode('delete');
  };

  const closeModal = () => {
    setModalMode('none');
    setSelectedEquipment(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code || !formData.location) {
      return;
    }
    setLoading(true);
    try {
      if (modalMode === 'add') {
        await createEquipment(formData);
      } else if (modalMode === 'edit' && selectedEquipment) {
        await updateEquipment(selectedEquipment.id, formData);
      }
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEquipment) return;
    setLoading(true);
    try {
      await deleteEquipment(selectedEquipment.id);
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  const canEdit = hasPermission('edit_equipment');
  const canDelete = hasPermission('edit_equipment');

  return (
    <Layout currentPage="equipment" onNavigate={onNavigate} title="设备档案" subtitle="管理游乐园所有大型设备信息">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索设备名称、编号、位置..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EquipmentStatus | 'all')}
              className="form-select w-32"
            >
              <option value="all">全部状态</option>
              <option value="normal">正常运行</option>
              <option value="abnormal">异常</option>
              <option value="stopped">停运</option>
            </select>
          </div>
        </div>
        {canEdit && (
          <button onClick={openAddModal} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            新增设备
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipments.map(equipment => (
          <div key={equipment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 text-lg">{equipment.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[equipment.status]}`}>
                    {statusLabels[equipment.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{equipment.code}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{equipment.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Activity className="w-4 h-4 text-gray-400" />
                <span>运行时长: {equipment.operation_hours.toLocaleString()} 小时</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>安装日期: {equipment.installed_date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={() => openDetailModal(equipment)}
                className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-1"
              >
                <Eye className="w-4 h-4" />
                详情
              </button>
              {canEdit && (
                <button 
                  onClick={() => openEditModal(equipment)}
                  className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  编辑
                </button>
              )}
              {canDelete && (
                <button 
                  onClick={() => openDeleteModal(equipment)}
                  className="p-2 text-danger hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEquipments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          暂无设备数据
        </div>
      )}

      {modalMode !== 'none' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {modalMode === 'detail' && selectedEquipment && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl text-gray-800">设备详情</h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">设备名称</p>
                      <p className="font-medium text-gray-800">{selectedEquipment.name}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">设备编号</p>
                      <p className="font-medium text-gray-800">{selectedEquipment.code}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">设备型号</p>
                      <p className="font-medium text-gray-800">{selectedEquipment.model}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">生产厂家</p>
                      <p className="font-medium text-gray-800">{selectedEquipment.manufacturer}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">安装位置</p>
                      <p className="font-medium text-gray-800 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedEquipment.location}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">设备状态</p>
                      <span className={`px-3 py-1 rounded-full ${statusColors[selectedEquipment.status]}`}>
                        {statusLabels[selectedEquipment.status]}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">安装日期</p>
                      <p className="font-medium text-gray-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {selectedEquipment.installed_date}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">运行时长</p>
                      <p className="font-medium text-gray-800 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {selectedEquipment.operation_hours.toLocaleString()} 小时
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">创建时间</p>
                      <p className="font-medium text-gray-800">{selectedEquipment.created_at}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">更新时间</p>
                      <p className="font-medium text-gray-800">{selectedEquipment.updated_at}</p>
                    </div>
                    <div className="text-center p-4 bg-primary-50 rounded-lg">
                      <p className="text-sm text-primary-600 mb-3">设备二维码</p>
                      <img
                        src={selectedEquipment.qr_code_url}
                        alt="设备二维码"
                        className="mx-auto w-32 h-32 border border-primary-200 rounded-lg"
                      />
                      <p className="text-xs text-primary-500 mt-2">扫码查看设备信息</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={closeModal} className="flex-1 btn btn-secondary">关闭</button>
                  {canEdit && (
                    <button onClick={() => { closeModal(); openEditModal(selectedEquipment); }} className="flex-1 btn btn-primary flex items-center justify-center gap-2">
                      <Edit2 className="w-4 h-4" />
                      编辑设备
                    </button>
                  )}
                </div>
              </>
            )}

            {(modalMode === 'add' || modalMode === 'edit') && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl text-gray-800">
                    {modalMode === 'add' ? '新增设备' : '编辑设备'}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">设备名称 *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="form-input"
                        placeholder="请输入设备名称"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">设备编号 *</label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="form-input"
                        placeholder="如: EQ001"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">设备型号</label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="form-input"
                        placeholder="请输入设备型号"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">生产厂家</label>
                      <input
                        type="text"
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        className="form-input"
                        placeholder="请输入生产厂家"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">安装位置 *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="form-input"
                      placeholder="如: 欢乐区A区"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">设备状态</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as EquipmentStatus })}
                        className="form-select"
                      >
                        <option value="normal">正常运行</option>
                        <option value="abnormal">异常</option>
                        <option value="stopped">停运</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">安装日期</label>
                      <input
                        type="date"
                        value={formData.installed_date}
                        onChange={(e) => setFormData({ ...formData, installed_date: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">运行时长（小时）</label>
                    <input
                      type="number"
                      value={formData.operation_hours}
                      onChange={(e) => setFormData({ ...formData, operation_hours: parseInt(e.target.value) || 0 })}
                      className="form-input"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={closeModal} className="flex-1 btn btn-secondary">取消</button>
                  <button 
                    onClick={handleSave}
                    disabled={loading || !formData.name || !formData.code || !formData.location}
                    className="flex-1 btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? '保存中...' : '保存'}
                  </button>
                </div>
              </>
            )}

            {modalMode === 'delete' && selectedEquipment && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl text-gray-800">确认删除</h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-4 bg-red-50 rounded-lg mb-6">
                  <div className="flex items-center gap-3 text-red-600">
                    <AlertTriangle className="w-6 h-6" />
                    <p>删除后数据将无法恢复，请确认是否继续？</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">即将删除的设备：</p>
                  <p className="font-medium text-gray-800">{selectedEquipment.name} ({selectedEquipment.code})</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedEquipment.location}</p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={closeModal} className="flex-1 btn btn-secondary">取消</button>
                  <button 
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 btn btn-danger flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {loading ? '删除中...' : '确认删除'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}