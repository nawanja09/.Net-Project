namespace HRManagement.API.Models
{
    public class Designation
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public Tenant? Tenant { get; set; }

        public string Title { get; set; } = string.Empty;

        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}