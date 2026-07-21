// ---- Auth ----

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  companyName: string;
}

export interface User {
  email: string;
  role: string;
  companyName: string;
}

// ---- Employees ----

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  departmentName: string | null;
  designationTitle: string | null;
  joinDate: string;
}

// Same shape as Employee today; kept as a separate type in case the
// detail view needs extra fields later (e.g. attendance/leave summaries).
export type EmployeeDetail = Employee;

// ---- Departments & Designations ----

export interface Department {
  id: number;
  name: string;
  employeeCount: number;
}

export interface Designation {
  id: number;
  title: string;
  employeeCount: number;
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
}

export interface LeaveRequestItem {
  id: number;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string;
  status: string;
  approvedByName: string | null;
}

export interface LeaveBalanceItem {
  leaveType: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}