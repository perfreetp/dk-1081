import { useEffect, useState } from 'react';
import { Plus, Search, Filter, QrCode, Edit2, Trash2, Eye, Activity, MapPin, Calendar } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useEquipmentStore } from '../stores/equipment';
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

export default function EquipmentList({ onNavigate }: EquipmentListProps) {
  const { equipments, fetchEquipments, deleteEquipment } = useEquipmentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

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
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          新增设备
        </button>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedEquipment(equipment)}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="查看二维码"
                >
                  <QrCode className="w-5 h-5" />
                </button>
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
              <button className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-1">
                <Eye className="w-4 h-4" />
                详情
              </button>
              <button className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-1">
                <Edit2 className="w-4 h-4" />
                编辑
              </button>
              <button className="p-2 text-danger hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedEquipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedEquipment(null)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-800">设备二维码</h3>
              <button onClick={() => setSelectedEquipment(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">{selectedEquipment.name}</p>
              <p className="text-xs text-gray-400 mb-4">{selectedEquipment.code}</p>
              <img
                src={selectedEquipment.qr_code_url}
                alt="设备二维码"
                className="mx-auto w-48 h-48 border border-gray-200 rounded-lg"
              />
              <p className="text-xs text-gray-400 mt-4">扫码查看设备详情</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
