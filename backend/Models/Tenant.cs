namespace HRManagement.API.Models
{
    public class Tenant
    {
        public int Id { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string SubscriptionPlan { get; set; } = "Free"; // Free, Pro, Enterprise
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<Department> Departments { get; set; } = new List<Department>();
    }
}