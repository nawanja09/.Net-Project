namespace HRManagement.API.DTOs
{
    public class CreateEmployeeRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public int? DepartmentId { get; set; }
        public int? DesignationId { get; set; }
        public DateTime? JoinDate { get; set; }
    }

    public class UpdateEmployeeRequest
    {
        public string FullName { get; set; } = string.Empty;
        public int? DepartmentId { get; set; }
        public int? DesignationId { get; set; }
    }

    public class EmployeeResponse
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? DepartmentName { get; set; }
        public string? DesignationTitle { get; set; }
        public DateTime JoinDate { get; set; }
    }
}