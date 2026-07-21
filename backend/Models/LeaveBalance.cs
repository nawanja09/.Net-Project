namespace HRManagement.API.Models
{
    public class LeaveBalance
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        public string LeaveType { get; set; } = "Annual"; // Annual, Sick, Casual
        public int TotalDays { get; set; }
        public int UsedDays { get; set; }
    }
}