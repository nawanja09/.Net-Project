namespace HRManagement.API.Models
{
    public class Payslip
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        public int Month { get; set; }
        public int Year { get; set; }
        public decimal BasicSalary { get; set; }
        public decimal Deductions { get; set; }
        public decimal NetPay { get; set; }
    }
}