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