import { useEffect, useState } from 'react';
import { Package, Search, Filter, Plus, AlertTriangle, MapPin, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useSparePartsStore } from '../stores/spareParts';
import { SparePart, SparePartRequestStatus } from '../types';

interface SparePartsListProps {
  onNavigate: (page: string) => void;
}

const statusColors: Record<SparePartRequestStatus, string> = {
  pending: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  issued: 'bg-gray-100 text-gray-800',
  canceled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<SparePartRequestStatus, string> = {
  pending: '待审批',
  approved: '已批准',
  issued: '已发放',
  canceled: '已取消',
};

export default function SparePartsList({ onNavigate }: SparePartsListProps) {
  const { spareParts, fetchSpareParts, requests, fetchRequests, approveRequest, issueRequest, createRequest } = useSparePartsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [requestReason, setRequestReason] = useState('');

  useEffect(() => {
    fetchSpareParts();
    fetchRequests();
  }, []);

  const filteredParts = spareParts.filter(sp => 
    sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sp.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLowStock = (part: SparePart) => part.quantity <= part.min_stock;

  const handleApprove = async (id: string) => {
    await approveRequest(id, true);
  };

  const handleIssue = async (id: string) => {
    await issueRequest(id);
  };

  const handleCreateRequest = async () => {
    if (selectedPart && requestQuantity > 0 && requestReason) {
      await createRequest({
        spare_part_id: selectedPart.id,
        requester_id: '2',
        quantity: requestQuantity,
        reason: requestReason,
      });
      setSelectedPart(null);
      setRequestQuantity(1);
      setRequestReason('');
    }
  };

  return (
    <Layout currentPage="spare-parts" onNavigate={onNavigate} title="备件领用" subtitle="管理备件库存与领用申请">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索备件名称、编号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64"
            />
          </div>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          入库备件
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredParts.map(part => (
          <div key={part.id} className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
            isLowStock(part) ? 'border-red-200' : 'border-gray-100'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800">{part.name}</h3>
                  {isLowStock(part) && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      库存不足
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{part.code}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">规格型号</span>
                <span className="text-gray-800">{part.specification}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">存放位置</span>
                <span className="text-gray-800 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {part.location}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">单位</span>
                <span className="text-gray-800">{part.unit}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">库存数量</span>
                <span className={`font-bold ${isLowStock(part) ? 'text-red-600' : 'text-gray-800'}`}>
                  {part.quantity} {part.unit}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isLowStock(part) ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((part.quantity / (part.min_stock * 2)) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">最低库存: {part.min_stock} {part.unit}</p>
            </div>

            <button
              onClick={() => setSelectedPart(part)}
              className="w-full mt-4 btn btn-secondary text-sm flex items-center justify-center gap-1"
            >
              申请领用 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">领用申请记录</h3>
          <span className="text-sm text-gray-500">共 {requests.length} 条记录</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">申请编号</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">备件名称</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">数量</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">申请人</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">状态</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => {
                const part = spareParts.find(sp => sp.id === request.spare_part_id);
                return (
                  <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{request.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{part?.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{request.quantity} {part?.unit}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">李明</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[request.status]}`}>
                        {statusLabels[request.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            批准
                          </button>
                        )}
                        {request.status === 'approved' && (
                          <button
                            onClick={() => handleIssue(request.id)}
                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            <Package className="w-4 h-4" />
                            发放
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedPart(null)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-800">领用申请</h3>
              <button onClick={() => setSelectedPart(null)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">备件名称</label>
                <input
                  type="text"
                  value={selectedPart.name}
                  disabled
                  className="form-input bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">当前库存</label>
                <input
                  type="text"
                  value={`${selectedPart.quantity} ${selectedPart.unit}`}
                  disabled
                  className="form-input bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">申请数量</label>
                <input
                  type="number"
                  min="1"
                  max={selectedPart.quantity}
                  value={requestQuantity}
                  onChange={(e) => setRequestQuantity(Math.min(parseInt(e.target.value) || 1, selectedPart.quantity))}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">领用原因</label>
                <textarea
                  rows={3}
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="请填写领用原因..."
                  className="form-textarea"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 btn btn-secondary" onClick={() => setSelectedPart(null)}>
                取消
              </button>
              <button 
                className="flex-1 btn btn-primary" 
                onClick={handleCreateRequest}
                disabled={requestQuantity <= 0 || !requestReason}
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
