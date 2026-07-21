namespace HRManagement.API.Models
{
    public enum LeaveStatus
    {
        Pending,
        Approved,
        Rejected
    }

    public class LeaveRequest
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Reason { get; set; } = string.Empty;
        public LeaveStatus Status { get; set; } = LeaveStatus.Pending;

        public int? ApprovedByUserId { get; set; }
        public User? ApprovedBy { get; set; }
    }
}