import { useEffect, useState } from 'react';
import { AlertTriangle, Search, Filter, Plus, Clock, CheckCircle, XCircle, FileText, ChevronRight, AlertCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useExceptionStore } from '../stores/exception';
import { useEquipmentStore } from '../stores/equipment';
import { Exception, ExceptionLevel, ExceptionStatus } from '../types';

interface ExceptionListProps {
  onNavigate: (page: string) => void;
}

const levelColors: Record<ExceptionLevel, string> = {
  minor: 'bg-yellow-100 text-yellow-800',
  major: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const levelLabels: Record<ExceptionLevel, string> = {
  minor: '一般',
  major: '严重',
  critical: '紧急',
};

const statusColors: Record<ExceptionStatus, string> = {
  reported: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<ExceptionStatus, string> = {
  reported: '待处理',
  processing: '处理中',
  resolved: '已解决',
  closed: '已关闭',
};

export default function ExceptionList({ onNavigate }: ExceptionListProps) {
  const { exceptions, fetchExceptions, requestStop, approveStop, resolveException } = useExceptionStore();
  const { equipments, fetchEquipments } = useEquipmentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<ExceptionLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ExceptionStatus | 'all'>('all');
  const [selectedException, setSelectedException] = useState<Exception | null>(null);

  useEffect(() => {
    fetchExceptions();
    fetchEquipments();
  }, []);

  const filteredExceptions = exceptions.filter(e => {
    const equipment = equipments.find(equip => equip.id === e.equipment_id);
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         equipment?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || e.level === levelFilter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const handleRequestStop = async (id: string) => {
    await requestStop(id);
  };

  const handleApproveStop = async (id: string, approved: boolean) => {
    await approveStop(id, approved);
  };

  const handleResolve = async (id: string) => {
    await resolveException(id);
  };

  return (
    <Layout currentPage="exceptions" onNavigate={onNavigate} title="异常处理" subtitle="管理设备异常报告与处理流程">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索设备名称、异常描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as ExceptionLevel | 'all')}
              className="form-select w-28"
            >
              <option value="all">全部等级</option>
              <option value="minor">一般</option>
              <option value="major">严重</option>
              <option value="critical">紧急</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ExceptionStatus | 'all')}
              className="form-select w-32"
            >
              <option value="all">全部状态</option>
              <option value="reported">待处理</option>
              <option value="processing">处理中</option>
              <option value="resolved">已解决</option>
              <option value="closed">已关闭</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          上报异常
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredExceptions.map(exception => {
          const equipment = equipments.find(e => e.id === exception.equipment_id);
          return (
            <div key={exception.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${levelColors[exception.level]} rounded-lg flex items-center justify-center`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{equipment?.name}</h3>
                    <p className="text-sm text-gray-500">{exception.created_at}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${levelColors[exception.level]}`}>
                    {levelLabels[exception.level]}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[exception.status]}`}>
                    {statusLabels[exception.status]}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{exception.description}</p>

              {exception.stop_requested && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">已申请停运，等待审批</span>
                  </div>
                </div>
              )}

              {exception.stop_approved && (
                <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-center gap-2 text-orange-600">
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm">设备已停运</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedException(exception)}
                  className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <FileText className="w-4 h-4" />
                  详情
                </button>
                {exception.status === 'reported' && (
                  <>
                    <button
                      onClick={() => handleRequestStop(exception.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                    >
                      申请停运
                    </button>
                  </>
                )}
                {exception.status === 'processing' && (
                  <button
                    onClick={() => handleResolve(exception.id)}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                  >
                    完成处理
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedException && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedException(null)}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${levelColors[selectedException.level]} rounded-xl flex items-center justify-center`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800">异常详情</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${levelColors[selectedException.level]}`}>
                      {levelLabels[selectedException.level]}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[selectedException.status]}`}>
                      {statusLabels[selectedException.status]}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedException(null)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">关联设备</label>
                <p className="text-gray-800">{equipments.find(e => e.id === selectedException.equipment_id)?.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">异常描述</label>
                <p className="text-gray-800">{selectedException.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">上报时间</label>
                  <p className="text-gray-800">{selectedException.created_at}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">更新时间</label>
                  <p className="text-gray-800">{selectedException.updated_at}</p>
                </div>
              </div>

              {selectedException.stop_requested && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-red-500" />
                      <span className="text-red-700">已申请设备停运</span>
                    </div>
                    {selectedException.stop_approved ? (
                      <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">已批准</span>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveStop(selectedException.id, true)}
                          className="btn btn-success text-sm"
                        >
                          批准停运
                        </button>
                        <button
                          onClick={() => handleApproveStop(selectedException.id, false)}
                          className="btn btn-secondary text-sm"
                        >
                          驳回
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">处理流程</h4>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-4">
                    <div className="relative pl-10">
                      <div className="absolute left-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="font-medium text-gray-800">异常上报</p>
                      <p className="text-sm text-gray-500">{selectedException.created_at} 由维修员上报</p>
                    </div>
                    {selectedException.status === 'processing' && (
                      <div className="relative pl-10">
                        <div className="absolute left-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-yellow-600" />
                        </div>
                        <p className="font-medium text-gray-800">处理中</p>
                        <p className="text-sm text-gray-500">维修人员正在处理此异常</p>
                      </div>
                    )}
                    {selectedException.status === 'resolved' && (
                      <>
                        <div className="relative pl-10">
                          <div className="absolute left-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <p className="font-medium text-gray-800">处理完成</p>
                          <p className="text-sm text-gray-500">异常已修复，等待复检确认</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button className="flex-1 btn btn-secondary" onClick={() => setSelectedException(null)}>
                关闭
              </button>
              {selectedException.status === 'resolved' && (
                <button className="flex-1 btn btn-primary">
                  复检确认
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
