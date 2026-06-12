export type UserRole = 'equipment_supervisor' | 'maintainer' | 'shift_manager';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  department: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export type EquipmentStatus = 'normal' | 'abnormal' | 'stopped';

export interface Equipment {
  id: string;
  name: string;
  code: string;
  model: string;
  manufacturer: string;
  department_id: string;
  location: string;
  status: EquipmentStatus;
  installed_date: string;
  operation_hours: number;
  qr_code_url: string;
  created_at: string;
  updated_at: string;
}

export type PeriodType = 'daily' | 'weekly' | 'monthly';

export interface InspectionRoute {
  id: string;
  name: string;
  description: string;
  equipment_ids: string[];
  period_type: PeriodType;
  period_value: number;
  created_by: string;
  created_at: string;
}

export type TaskStatus = 'pending' | 'executing' | 'completed' | 'overdue';

export interface InspectionTask {
  id: string;
  route_id: string;
  equipment_id: string;
  scheduled_date: string;
  status: TaskStatus;
  assigned_to: string;
  created_at: string;
}

export type InspectionResultStatus = 'normal' | 'abnormal';

export interface InspectionRecord {
  id: string;
  task_id: string;
  equipment_id: string;
  inspector_id: string;
  inspection_time: string;
  status: InspectionResultStatus;
  notes: string;
  photos: string[];
  created_at: string;
}

export type ExceptionLevel = 'minor' | 'major' | 'critical';
export type ExceptionStatus = 'reported' | 'processing' | 'resolved' | 'closed';

export interface Exception {
  id: string;
  equipment_id: string;
  reporter_id: string;
  level: ExceptionLevel;
  description: string;
  photos: string[];
  status: ExceptionStatus;
  stop_requested: boolean;
  stop_approved: boolean;
  created_at: string;
  updated_at: string;
}

export type WorkOrderStatus = 'pending' | 'accepted' | 'processing' | 'completed' | 'verified';
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface WorkOrder {
  id: string;
  exception_id: string;
  equipment_id: string;
  title: string;
  description: string;
  assignee_id: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderLog {
  id: string;
  work_order_id: string;
  operator_id: string;
  action: string;
  comment: string;
  created_at: string;
}

export type MaintenanceType = 'routine' | 'repair' | 'overhaul';

export interface MaintenanceRecord {
  id: string;
  equipment_id: string;
  type: MaintenanceType;
  performed_by: string;
  start_date: string;
  end_date: string;
  cost: number;
  description: string;
  created_at: string;
}

export interface SparePart {
  id: string;
  name: string;
  code: string;
  specification: string;
  unit: string;
  quantity: number;
  min_stock: number;
  location: string;
  created_at: string;
  updated_at: string;
}

export type SparePartRequestStatus = 'pending' | 'approved' | 'issued' | 'canceled';

export interface SparePartRequest {
  id: string;
  spare_part_id: string;
  requester_id: string;
  quantity: number;
  reason: string;
  status: SparePartRequestStatus;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ShiftType = 'morning' | 'afternoon' | 'night';

export interface ShiftRecord {
  id: string;
  shift_type: ShiftType;
  date: string;
  handover_by: string;
  takeover_by: string;
  issues: string;
  created_at: string;
}

export interface StatisticsOverview {
  total_equipment: number;
  normal_equipment: number;
  abnormal_equipment: number;
  stopped_equipment: number;
  pending_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  pending_exceptions: number;
  pending_work_orders: number;
  low_stock_parts: number;
}

export interface InspectionStatistics {
  daily_completion_rate: number;
  weekly_completion_rate: number;
  monthly_completion_rate: number;
  trend_data: { date: string; completed: number; total: number }[];
}

export interface MaintenanceStatistics {
  total_work_orders: number;
  completed_work_orders: number;
  average_duration: number;
  cost_by_month: { month: string; cost: number }[];
}
