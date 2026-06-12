import { useEffect, useState } from 'react';
import { BarChart3, Download, TrendingUp, Calendar, Clock, AlertTriangle, CheckCircle, FileText, Plus } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useStatisticsStore } from '../stores/statistics';
import { useEquipmentStore } from '../stores/equipment';
import { useInspectionStore } from '../stores/inspection';
import { useExceptionStore } from '../stores/exception';

interface StatisticsProps {
  onNavigate: (page: string) => void;
}

export default function Statistics({ onNavigate }: StatisticsProps) {
  const { overview, fetchOverview, inspectionStats, fetchInspectionStats, maintenanceStats, fetchMaintenanceStats, shiftRecords, fetchShiftRecords, exportReport } = useStatisticsStore();
  const { equipments, fetchEquipments } = useEquipmentStore();
  const { tasks, fetchTasks } = useInspectionStore();
  const { exceptions, fetchExceptions } = useExceptionStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'inspection' | 'maintenance' | 'shift'>('overview');

  useEffect(() => {
    fetchOverview();
    fetchInspectionStats();
    fetchMaintenanceStats();
    fetchShiftRecords();
    fetchEquipments();
    fetchTasks();
    fetchExceptions();
  }, []);

  const handleExport = () => {
    const report = exportReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `设备巡检报告_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const overdueTasks = tasks.filter(t => t.status === 'overdue');
  const resolvedExceptions = exceptions.filter(e => e.status === 'resolved' || e.status === 'closed');
  const pendingExceptions = exceptions.filter(e => e.status === 'reported' || e.status === 'processing');

  return (
    <Layout currentPage="statistics" onNavigate={onNavigate} title="统计分析" subtitle="数据报表与趋势分析">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['overview', 'inspection', 'maintenance', 'shift'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab === 'overview' && '概览'}
                {tab === 'inspection' && '巡检统计'}
                {tab === 'maintenance' && '维修统计'}
                {tab === 'shift' && '交接班'}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleExport} className="btn btn-primary flex items-center gap-2">
          <Download className="w-5 h-5" />
          导出报表
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">设备总数</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{equipments.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">今日巡检完成率</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">待处理异常</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{pendingExceptions.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">逾期任务</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{overdueTasks.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">设备状态分布</h3>
              <div className="space-y-4">
                {[
                  { label: '正常运行', value: equipments.filter(e => e.status === 'normal').length, color: 'bg-green-500', total: equipments.length },
                  { label: '异常', value: equipments.filter(e => e.status === 'abnormal').length, color: 'bg-yellow-500', total: equipments.length },
                  { label: '停运', value: equipments.filter(e => e.status === 'stopped').length, color: 'bg-red-500', total: equipments.length },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="text-sm font-medium text-gray-800">{item.value} 台 ({Math.round((item.value / item.total) * 100)}%)</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${(item.value / item.total) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">异常等级分布</h3>
              <div className="space-y-4">
                {[
                  { label: '一般', value: exceptions.filter(e => e.level === 'minor').length, color: 'bg-yellow-500' },
                  { label: '严重', value: exceptions.filter(e => e.level === 'major').length, color: 'bg-orange-500' },
                  { label: '紧急', value: exceptions.filter(e => e.level === 'critical').length, color: 'bg-red-500' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="text-sm font-medium text-gray-800">{item.value} 条</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${exceptions.length > 0 ? (item.value / exceptions.length) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inspection' && inspectionStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-gray-500 text-sm">今日完成率</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">{inspectionStats.daily_completion_rate}%</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-gray-500 text-sm">本周完成率</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">{inspectionStats.weekly_completion_rate}%</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-gray-500 text-sm">本月完成率</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">{inspectionStats.monthly_completion_rate}%</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-6">近7天巡检趋势</h3>
            <div className="flex items-end justify-between h-48 gap-4">
              {inspectionStats.trend_data.map((item, index) => {
                const maxTotal = Math.max(...inspectionStats.trend_data.map(d => d.total));
                const height = (item.completed / maxTotal) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-primary-100 rounded-t-lg relative overflow-hidden">
                      <div 
                        className="w-full bg-primary-600 rounded-t-lg transition-all duration-500"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="absolute top-0 right-0 p-1 bg-white/80 rounded-bl-lg">
                        <span className="text-xs font-medium text-primary-600">{item.completed}/{item.total}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{item.date.slice(5)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && maintenanceStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-gray-500 text-sm">总工单数</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{maintenanceStats.total_work_orders}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-gray-500 text-sm">已完成</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{maintenanceStats.completed_work_orders}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-gray-500 text-sm">平均时长</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">{maintenanceStats.average_duration} 天</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-6">月度维修费用</h3>
            <div className="flex items-end justify-between h-48 gap-4">
              {maintenanceStats.cost_by_month.map((item, index) => {
                const maxCost = Math.max(...maintenanceStats.cost_by_month.map(d => d.cost));
                const height = (item.cost / maxCost) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-blue-100 rounded-t-lg">
                      <div 
                        className="w-full bg-blue-600 rounded-t-lg transition-all duration-500"
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{item.month}</p>
                    <p className="text-xs font-medium text-gray-700">{(item.cost / 10000).toFixed(1)}万</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shift' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">今日交接班记录</h3>
              <button className="btn btn-primary flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" />
                新建记录
              </button>
            </div>
            <div className="space-y-4">
              {shiftRecords.map(record => (
                <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-800">
                        {record.shift_type === 'morning' && '早班'}
                        {record.shift_type === 'afternoon' && '中班'}
                        {record.shift_type === 'night' && '晚班'}
                      </span>
                      <span className="text-sm text-gray-500">{record.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span>交班人: {record.handover_by}</span>
                    <span>接班人: {record.takeover_by}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{record.issues}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">班次时间安排</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: '早班', time: '08:00 - 16:00', icon: '☀️' },
                { name: '中班', time: '16:00 - 24:00', icon: '🌤️' },
                { name: '晚班', time: '00:00 - 08:00', icon: '🌙' },
              ].map(shift => (
                <div key={shift.name} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl mb-2">{shift.icon}</div>
                  <p className="font-medium text-gray-800">{shift.name}</p>
                  <p className="text-sm text-gray-500">{shift.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
