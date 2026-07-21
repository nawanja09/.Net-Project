namespace HRManagement.API.Models
{
    public enum AttendanceStatus
    {
        Present,
        Absent,
        Late,
        HalfDay
    }

    public class Attendance
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        public DateTime Date { get; set; }
        public TimeSpan? CheckIn { get; set; }
        public TimeSpan? CheckOut { get; set; }
        public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
    }
}