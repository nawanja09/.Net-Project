namespace HRManagement.API.Models
{
    public class Department
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public Tenant? Tenant { get; set; }

        public string Name { get; set; } = string.Empty;

        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}