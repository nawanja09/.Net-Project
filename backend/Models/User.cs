namespace HRManagement.API.Models
{
    public enum UserRole
    {
        Admin,
        HRManager,
        Employee
    }

    public class User
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public Tenant? Tenant { get; set; }

        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Employee;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Employee? Employee { get; set; }
    }
}