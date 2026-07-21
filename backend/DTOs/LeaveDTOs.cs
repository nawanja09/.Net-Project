namespace HRManagement.API.DTOs
{
    public class CreateLeaveRequest
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string LeaveType { get; set; } = "Annual"; // Annual, Sick, Casual
    }

    public class ReviewLeaveRequest
    {
        public bool Approve { get; set; } // true = Approved, false = Rejected
    }

    public class LeaveRequestResponse
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int DaysRequested { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ApprovedByName { get; set; }
    }

    public class LeaveBalanceResponse
    {
        public string LeaveType { get; set; } = string.Empty;
        public int TotalDays { get; set; }
        public int UsedDays { get; set; }
        public int RemainingDays { get; set; }
    }

    public class SetLeaveBalanceRequest
    {
        public int EmployeeId { get; set; }
        public string LeaveType { get; set; } = "Annual";
        public int TotalDays { get; set; }
    }
}