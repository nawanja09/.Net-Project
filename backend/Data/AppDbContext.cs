using Microsoft.EntityFrameworkCore;
using HRManagement.API.Models;

namespace HRManagement.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Tenant> Tenants => Set<Tenant>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Department> Departments => Set<Department>();
        public DbSet<Designation> Designations => Set<Designation>();
        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<Attendance> AttendanceRecords => Set<Attendance>();
        public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
        public DbSet<LeaveBalance> LeaveBalances => Set<LeaveBalance>();
        public DbSet<Payslip> Payslips => Set<Payslip>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ---- Enum to string conversions (readable in DB, easier to debug) ----
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<Attendance>()
                .Property(a => a.Status)
                .HasConversion<string>();

            modelBuilder.Entity<LeaveRequest>()
                .Property(l => l.Status)
                .HasConversion<string>();

            // ---- Prevent duplicate emails within the same tenant ----
            modelBuilder.Entity<User>()
                .HasIndex(u => new { u.TenantId, u.Email })
                .IsUnique();

            // ---- Decimal precision for payslip amounts ----
            modelBuilder.Entity<Payslip>()
                .Property(p => p.BasicSalary)
                .HasPrecision(12, 2);

            modelBuilder.Entity<Payslip>()
                .Property(p => p.Deductions)
                .HasPrecision(12, 2);

            modelBuilder.Entity<Payslip>()
                .Property(p => p.NetPay)
                .HasPrecision(12, 2);

            // ====================================================================
            // IMPORTANT: Cascade delete fixes below.
            // SQL Server does not allow multiple cascade paths reaching the same
            // table. Since Employee already cascades from Tenant, every OTHER
            // foreign key on Employee (and on LeaveRequest.ApprovedBy) must be
            // set to Restrict (NO ACTION) instead of Cascade.
            // ====================================================================

            // Employee -> User (one-to-one). Restrict, not cascade.
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.User)
                .WithOne(u => u.Employee)
                .HasForeignKey<Employee>(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Employee -> Department. Restrict, not cascade.
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Department)
                .WithMany(d => d.Employees)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Employee -> Designation. Restrict, not cascade.
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Designation)
                .WithMany(d => d.Employees)
                .HasForeignKey(e => e.DesignationId)
                .OnDelete(DeleteBehavior.Restrict);

            // Employee -> Tenant. This is the ONE path allowed to cascade.
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Tenant)
                .WithMany()
                .HasForeignKey(e => e.TenantId)
                .OnDelete(DeleteBehavior.Cascade);

            // LeaveRequest -> ApprovedBy (User). Restrict, not cascade.
            modelBuilder.Entity<LeaveRequest>()
                .HasOne(l => l.ApprovedBy)
                .WithMany()
                .HasForeignKey(l => l.ApprovedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // LeaveRequest -> Employee. Restrict, since Employee already has
            // its own cascade chain back to Tenant; keep this one path clean.
            modelBuilder.Entity<LeaveRequest>()
                .HasOne(l => l.Employee)
                .WithMany(e => e.LeaveRequests)
                .HasForeignKey(l => l.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Attendance -> Employee. Restrict.
            modelBuilder.Entity<Attendance>()
                .HasOne(a => a.Employee)
                .WithMany(e => e.AttendanceRecords)
                .HasForeignKey(a => a.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            // LeaveBalance -> Employee. Restrict.
            modelBuilder.Entity<LeaveBalance>()
                .HasOne(lb => lb.Employee)
                .WithMany(e => e.LeaveBalances)
                .HasForeignKey(lb => lb.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Payslip -> Employee. Restrict.
            modelBuilder.Entity<Payslip>()
                .HasOne(p => p.Employee)
                .WithMany(e => e.Payslips)
                .HasForeignKey(p => p.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}