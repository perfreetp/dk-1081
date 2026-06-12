import { useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Package, Wrench, XCircle, TrendingUp, ArrowRight } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useStatisticsStore } from '../stores/statistics';
import { useEquipmentStore } from '../stores/equipment';
import { useInspectionStore } from '../stores/inspection';
import { useExceptionStore } from '../stores/exception';
import { useMaintenanceStore } from '../stores/maintenance';
import { useSparePartsStore } from '../stores/spareParts';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const StatCard = ({ icon: Icon, label, value, color, subValue }: { icon: typeof Activity; label: string; value: number | string; color: string; subValue?: string }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <p className="text-gray-500 text-sm mb-1">{label}</p>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
    {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
  </div>
);

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { overview, fetchOverview } = useStatisticsStore();
  const { equipments, fetchEquipments } = useEquipmentStore();
  const { tasks, fetchTasks } = useInspectionStore();
  const { exceptions, fetchExceptions } = useExceptionStore();
  const { workOrders, fetchWorkOrders } = useMaintenanceStore();
  const { spareParts, fetchSpareParts } = useSparePartsStore();

  useEffect(() => {
    fetchOverview();
    fetchEquipments();
    fetchTasks();
    fetchExceptions();
    fetchWorkOrders();
    fetchSpareParts();
  }, []);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const executingTasks = tasks.filter(t => t.status === 'executing');
  const overdueTasks = tasks.filter(t => t.status === 'overdue');
  const pendingExceptions = exceptions.filter(e => e.status === 'reported' || e.status === 'processing');
  const pendingWorkOrders = workOrders.filter(wo => wo.status === 'pending');
  const lowStockParts = spareParts.filter(sp => sp.quantity <= sp.min_stock);

  return (
    <Layout currentPage="dashboard" onNavigate={onNavigate} title="今日看板" subtitle="实时监控设备状态与待办任务">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Activity} label="设备总数" value={equipments.length} color="bg-primary-600" />
        <StatCard icon={CheckCircle} label="正常运行" value={equipments.filter(e => e.status === 'normal').length} color="bg-success" subValue={`${((equipments.filter(e => e.status === 'normal').length / equipments.length) * 100).toFixed(0)}%`} />
        <StatCard icon={AlertTriangle} label="异常设备" value={equipments.filter(e => e.status === 'abnormal').length} color="bg-warning-500" />
        <StatCard icon={XCircle} label="停运设备" value={equipments.filter(e => e.status === 'stopped').length} color="bg-danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Clock} label="待巡检任务" value={pendingTasks.length} color="bg-primary-500" />
        <StatCard icon={Wrench} label="待处理工单" value={pendingWorkOrders.length} color="bg-warning-500" />
        <StatCard icon={AlertTriangle} label="待处理异常" value={pendingExceptions.length} color="bg-red-500" />
        <StatCard icon={Package} label="库存预警" value={lowStockParts.length} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">今日任务</h3>
            <button onClick={() => onNavigate('routes')} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {pendingTasks.slice(0, 5).map(task => {
              const equipment = equipments.find(e => e.id === task.equipment_id);
              return (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-800">{equipment?.name}</p>
                      <p className="text-sm text-gray-500">{equipment?.code} | {equipment?.location}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{task.scheduled_date}</span>
                </div>
              );
            })}
            {executingTasks.slice(0, 3).map(task => {
              const equipment = equipments.find(e => e.id === task.equipment_id);
              return (
                <div key={task.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-primary-800">{equipment?.name}</p>
                      <p className="text-sm text-primary-600">巡检进行中...</p>
                    </div>
                  </div>
                  <span className="text-sm text-primary-500">执行中</span>
                </div>
              );
            })}
            {overdueTasks.map(task => {
              const equipment = equipments.find(e => e.id === task.equipment_id);
              return (
                <div key={task.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-danger rounded-full"></div>
                    <div>
                      <p className="font-medium text-danger">{equipment?.name}</p>
                      <p className="text-sm text-red-600">已逾期，请尽快处理</p>
                    </div>
                  </div>
                  <span className="text-sm text-danger font-medium">逾期</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">异常告警</h3>
            <div className="space-y-3">
              {pendingExceptions.slice(0, 4).map(exception => {
                const equipment = equipments.find(e => e.id === exception.equipment_id);
                const levelColors = { minor: 'bg-yellow-100 text-yellow-800', major: 'bg-orange-100 text-orange-800', critical: 'bg-red-100 text-red-800' };
                const levelLabels = { minor: '一般', major: '严重', critical: '紧急' };
                return (
                  <div key={exception.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${levelColors[exception.level]}`}>
                        {levelLabels[exception.level]}
                      </span>
                      <span className="text-xs text-gray-400">{exception.created_at}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">{equipment?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{exception.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-600 to-blue-900 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6" />
              <h3 className="font-semibold">巡检完成率</h3>
            </div>
            <div className="text-4xl font-bold mb-2">83%</div>
            <p className="text-sm text-blue-200">今日完成 5/6 项巡检任务</p>
            <div className="mt-4 h-2 bg-blue-700 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '83%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
