namespace HRManagement.API.DTOs
{
    public class DepartmentRequest
    {
        public string Name { get; set; } = string.Empty;
    }

    public class DepartmentResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int EmployeeCount { get; set; }
    }

    public class DesignationRequest
    {
        public string Title { get; set; } = string.Empty;
    }

    public class DesignationResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int EmployeeCount { get; set; }
    }
}