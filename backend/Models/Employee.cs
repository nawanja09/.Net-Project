namespace HRManagement.API.Models
{
    public class Employee
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public Tenant? Tenant { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public string FullName { get; set; } = string.Empty;

        public int? DepartmentId { get; set; }
        public Department? Department { get; set; }

        public int? DesignationId { get; set; }
        public Designation? Designation { get; set; }

        public DateTime JoinDate { get; set; } = DateTime.UtcNow;

        public ICollection<Attendance> AttendanceRecords { get; set; } = new List<Attendance>();
        public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
        public ICollection<LeaveBalance> LeaveBalances { get; set; } = new List<LeaveBalance>();
        public ICollection<Payslip> Payslips { get; set; } = new List<Payslip>();
    }
}