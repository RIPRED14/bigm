export interface Shift {
  id: number;
  employeeIds: number[];
  day: number; // 0 = Lundi, 6 = Dimanche
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface Employee {
  id: number;
  name: string;
  avatarUrl: string;
  weeklyHours: number;
  preferredTimes?: ('morning' | 'evening' | 'night')[];
}

export interface ShiftFormValues {
  employeeIds: number[];
  day: number;
  startTime: string;
  endTime: string;
  isNightShift?: boolean;
}

export interface ScheduleConflict {
  employeeId: number;
  shifts: Shift[];
  startTime?: string;
  endTime?: string;
}

export interface ScheduleRules {
  minEmployeesPerDay: number;
  maxEmployeesPerDay: number;
  minHoursPerDay: number;
  maxHoursPerDay: number;
  requireEveningCoverage: boolean;
}

export interface DaySummary {
  dayIndex: number;
  fillingPercentage: number;
  employeeCount: number;
  totalHours: number;
  status: 'good' | 'warning' | 'critical' | 'incomplete';
}

export interface AddShiftFormProps {
  employees: Employee[];
  onSubmit: (values: ShiftFormValues) => void;
  onCancel: () => void;
  preselectedDay?: number | null;
  preselectedTime?: string | null;
  preselectedEmployeeIds?: number[];
  isEditMode?: boolean;
  preselectedEndTime?: string | null;
}

export interface TimeSlotProps {
  time: string;
  dayIndex: number;
  shifts: Shift[];
  employees: Employee[];
  isSelected: boolean;
  onSelect: (time: string) => void;
  isMobile: boolean;
  isConflict: boolean;
}

export interface WeekSummaryProps {
  summary: DaySummary[];
  isMobile: boolean;
} 