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
    public class DesignationsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly CurrentUserService _currentUser;

        public DesignationsController(AppDbContext db, CurrentUserService currentUser)
        {
            _db = db;
            _currentUser = currentUser;
        }

        // GET /api/designations
        [HttpGet]
        public async Task<ActionResult<List<DesignationResponse>>> GetAll()
        {
            var designations = await _db.Designations
                .Where(d => d.TenantId == _currentUser.TenantId)
                .Select(d => new DesignationResponse
                {
                    Id = d.Id,
                    Title = d.Title,
                    EmployeeCount = d.Employees.Count
                })
                .ToListAsync();

            return Ok(designations);
        }

        // GET /api/designations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DesignationResponse>> GetById(int id)
        {
            var designation = await _db.Designations
                .Where(d => d.TenantId == _currentUser.TenantId && d.Id == id)
                .Select(d => new DesignationResponse
                {
                    Id = d.Id,
                    Title = d.Title,
                    EmployeeCount = d.Employees.Count
                })
                .FirstOrDefaultAsync();

            if (designation == null)
                return NotFound();

            return Ok(designation);
        }

        // POST /api/designations
        [HttpPost]
        [Authorize(Roles = "Admin,HRManager")]
        public async Task<ActionResult<DesignationResponse>> Create(DesignationRequest request)
        {
            var designation = new Designation
            {
                TenantId = _currentUser.TenantId,
                Title = request.Title
            };
            _db.Designations.Add(designation);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = designation.Id }, new DesignationResponse
            {
                Id = designation.Id,
                Title = designation.Title,
                EmployeeCount = 0
            });
        }

        // PUT /api/designations/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HRManager")]
        public async Task<IActionResult> Update(int id, DesignationRequest request)
        {
            var designation = await _db.Designations
                .FirstOrDefaultAsync(d => d.TenantId == _currentUser.TenantId && d.Id == id);

            if (designation == null)
                return NotFound();

            designation.Title = request.Title;
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // DELETE /api/designations/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var designation = await _db.Designations
                .Include(d => d.Employees)
                .FirstOrDefaultAsync(d => d.TenantId == _currentUser.TenantId && d.Id == id);

            if (designation == null)
                return NotFound();

            if (designation.Employees.Any())
                return BadRequest("Cannot delete a designation that still has employees assigned. Reassign them first.");

            _db.Designations.Remove(designation);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}