import { create } from 'zustand';
import { StatisticsOverview, InspectionStatistics, MaintenanceStatistics, ShiftRecord, ShiftType } from '../types';

interface StatisticsStore {
  overview: StatisticsOverview | null;
  inspectionStats: InspectionStatistics | null;
  maintenanceStats: MaintenanceStatistics | null;
  shiftRecords: ShiftRecord[];
  fetchOverview: () => Promise<void>;
  fetchInspectionStats: () => Promise<void>;
  fetchMaintenanceStats: () => Promise<void>;
  fetchShiftRecords: () => Promise<void>;
  createShiftRecord: (data: Omit<ShiftRecord, 'id' | 'created_at'>) => Promise<void>;
  exportReport: () => string;
}

export const useStatisticsStore = create<StatisticsStore>((set, get) => ({
  overview: null,
  inspectionStats: null,
  maintenanceStats: null,
  shiftRecords: [],

  fetchOverview: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({
      overview: {
        total_equipment: 6,
        normal_equipment: 4,
        abnormal_equipment: 1,
        stopped_equipment: 1,
        pending_tasks: 4,
        completed_tasks: 1,
        overdue_tasks: 1,
        pending_exceptions: 2,
        pending_work_orders: 1,
        low_stock_parts: 2,
      },
    });
  },

  fetchInspectionStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const today = new Date();
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      trendData.push({
        date: date.toISOString().split('T')[0],
        completed: Math.floor(Math.random() * 5) + 8,
        total: 12,
      });
    }
    set({
      inspectionStats: {
        daily_completion_rate: 83,
        weekly_completion_rate: 92,
        monthly_completion_rate: 88,
        trend_data: trendData,
      },
    });
  },

  fetchMaintenanceStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    set({
      maintenanceStats: {
        total_work_orders: 15,
        completed_work_orders: 12,
        average_duration: 2.5,
        cost_by_month: [
          { month: '1月', cost: 85000 },
          { month: '2月', cost: 62000 },
          { month: '3月', cost: 98000 },
          { month: '4月', cost: 75000 },
          { month: '5月', cost: 110000 },
          { month: '6月', cost: 88000 },
        ],
      },
    });
  },

  fetchShiftRecords: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const today = new Date().toISOString().split('T')[0];
    set({
      shiftRecords: [
        {
          id: 'SR001',
          shift_type: 'morning',
          date: today,
          handover_by: '张伟',
          takeover_by: '李明',
          issues: '1. 过山车运行正常；2. 旋转木马待维修；3. 激流勇进停运中',
          created_at: today,
        },
        {
          id: 'SR002',
          shift_type: 'afternoon',
          date: today,
          handover_by: '李明',
          takeover_by: '王强',
          issues: '1. 日常巡检任务已完成；2. 旋转木马维修中',
          created_at: today,
        },
      ],
    });
  },

  createShiftRecord: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newRecord: ShiftRecord = {
      ...data,
      id: `SR${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
    };
    set(state => ({ shiftRecords: [...state.shiftRecords, newRecord] }));
  },

  exportReport: () => {
    const { overview, inspectionStats } = get();
    const report = `游乐园设备巡检报告\n\n概览统计:\n- 设备总数: ${overview?.total_equipment}\n- 正常设备: ${overview?.normal_equipment}\n- 异常设备: ${overview?.abnormal_equipment}\n- 停运设备: ${overview?.stopped_equipment}\n\n巡检统计:\n- 今日完成率: ${inspectionStats?.daily_completion_rate}%\n- 本周完成率: ${inspectionStats?.weekly_completion_rate}%\n- 本月完成率: ${inspectionStats?.monthly_completion_rate}%\n\n生成时间: ${new Date().toLocaleString('zh-CN')}`;
    return report;
  },
}));
