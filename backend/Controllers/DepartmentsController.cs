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
    [Authorize]
    public class DepartmentsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly CurrentUserService _currentUser;

        public DepartmentsController(AppDbContext db, CurrentUserService currentUser)
        {
            _db = db;
            _currentUser = currentUser;
        }

        // GET /api/departments
        [HttpGet]
        public async Task<ActionResult<List<DepartmentResponse>>> GetAll()
        {
            var departments = await _db.Departments
                .Where(d => d.TenantId == _currentUser.TenantId)
                .Select(d => new DepartmentResponse
                {
                    Id = d.Id,
                    Name = d.Name,
                    EmployeeCount = d.Employees.Count
                })
                .ToListAsync();

            return Ok(departments);
        }

        // GET /api/departments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DepartmentResponse>> GetById(int id)
        {
            var department = await _db.Departments
                .Where(d => d.TenantId == _currentUser.TenantId && d.Id == id)
                .Select(d => new DepartmentResponse
                {
                    Id = d.Id,
                    Name = d.Name,
                    EmployeeCount = d.Employees.Count
                })
                .FirstOrDefaultAsync();

            if (department == null)
                return NotFound();

            return Ok(department);
        }

        // POST /api/departments
        [HttpPost]
        [Authorize(Roles = "Admin,HRManager")]
        public async Task<ActionResult<DepartmentResponse>> Create(DepartmentRequest request)
        {
            var department = new Department
            {
                TenantId = _currentUser.TenantId,
                Name = request.Name
            };
            _db.Departments.Add(department);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = department.Id }, new DepartmentResponse
            {
                Id = department.Id,
                Name = department.Name,
                EmployeeCount = 0
            });
        }

        // PUT /api/departments/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HRManager")]
        public async Task<IActionResult> Update(int id, DepartmentRequest request)
        {
            var department = await _db.Departments
                .FirstOrDefaultAsync(d => d.TenantId == _currentUser.TenantId && d.Id == id);

            if (department == null)
                return NotFound();

            department.Name = request.Name;
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // DELETE /api/departments/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var department = await _db.Departments
                .Include(d => d.Employees)
                .FirstOrDefaultAsync(d => d.TenantId == _currentUser.TenantId && d.Id == id);

            if (department == null)
                return NotFound();

            if (department.Employees.Any())
                return BadRequest("Cannot delete a department that still has employees assigned. Reassign them first.");

            _db.Departments.Remove(department);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}