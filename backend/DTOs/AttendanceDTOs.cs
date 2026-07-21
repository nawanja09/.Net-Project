namespace HRManagement.API.DTOs
{
    public class CheckInRequest
    {
        // Optional: Admin/HRManager can check in on behalf of an employee.
        // If null, the logged-in user's own employee record is used.
        public int? EmployeeId { get; set; }
    }

    public class CheckOutRequest
    {
        public int? EmployeeId { get; set; }
    }

    public class AttendanceResponse
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public TimeSpan? CheckIn { get; set; }
        public TimeSpan? CheckOut { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class MarkAttendanceRequest
    {
        public int EmployeeId { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; } = "Present"; // Present, Absent, Late, HalfDay
    }
}