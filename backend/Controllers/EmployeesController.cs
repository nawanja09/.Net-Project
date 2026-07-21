using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HRManagement.API.Data;
using HRManagement.API.DTOs;
using HRManagement.API.Models;
using HRManagement.API.Services;

namespace HRManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // every action here requires a valid JWT
    public class EmployeesController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly CurrentUserService _currentUser;

        public EmployeesController(AppDbContext db, CurrentUserService currentUser)
        {
            _db = db;
            _currentUser = currentUser;
        }

        // GET /api/employees
        [HttpGet]
        public async Task<ActionResult<List<EmployeeResponse>>> GetAll()
        {
            var employees = await _db.Employees
                .Where(e => e.TenantId == _currentUser.TenantId)
                .Include(e => e.User)
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .Select(e => new EmployeeResponse
                {
                    Id = e.Id,
                    FullName = e.FullName,
                    Email = e.User != null ? e.User.Email : string.Empty,
                    DepartmentName = e.Department != null ? e.Department.Name : null,
                    DesignationTitle = e.Designation != null ? e.Designation.Title : null,
                    JoinDate = e.JoinDate
                })
                .ToListAsync();

            return Ok(employees);
        }

        // GET /api/employees/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeResponse>> GetById(int id)
        {
            var employee = await _db.Employees
                .Where(e => e.TenantId == _currentUser.TenantId && e.Id == id)
                .Include(e => e.User)
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .FirstOrDefaultAsync();

            if (employee == null)
                return NotFound();

            return Ok(new EmployeeResponse
            {
                Id = employee.Id,
                FullName = employee.FullName,
                Email = employee.User?.Email ?? string.Empty,
                DepartmentName = employee.Department?.Name,
                DesignationTitle = employee.Designation?.Title,
                JoinDate = employee.JoinDate
            });
        }

        // POST /api/employees
        // Only Admin or HRManager can create employees
        [HttpPost]
        [Authorize(Roles = "Admin,HRManager")]
        public async Task<ActionResult<EmployeeResponse>> Create(CreateEmployeeRequest request)
        {
            var emailExists = await _db.Users.AnyAsync(u => u.Email == request.Email);
            if (emailExists)
                return BadRequest("An account with this email already exists.");

            // Every new employee also gets a login account
            var user = new User
            {
                TenantId = _currentUser.TenantId,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = UserRole.Employee
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var employee = new Employee
            {
                TenantId = _currentUser.TenantId,
                UserId = user.Id,
                FullName = request.FullName,
                DepartmentId = request.DepartmentId,
                DesignationId = request.DesignationId,
                JoinDate = request.JoinDate ?? DateTime.UtcNow
            };
            _db.Employees.Add(employee);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = employee.Id }, new EmployeeResponse
            {
                Id = employee.Id,
                FullName = employee.FullName,
                Email = user.Email,
                JoinDate = employee.JoinDate
            });
        }

        // PUT /api/employees/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HRManager")]
        public async Task<IActionResult> Update(int id, UpdateEmployeeRequest request)
        {
            var employee = await _db.Employees
                .FirstOrDefaultAsync(e => e.TenantId == _currentUser.TenantId && e.Id == id);

            if (employee == null)
                return NotFound();

            employee.FullName = request.FullName;
            employee.DepartmentId = request.DepartmentId;
            employee.DesignationId = request.DesignationId;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/employees/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var employee = await _db.Employees
                .FirstOrDefaultAsync(e => e.TenantId == _currentUser.TenantId && e.Id == id);

            if (employee == null)
                return NotFound();

            _db.Employees.Remove(employee);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}