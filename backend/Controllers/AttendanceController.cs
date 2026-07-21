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
    public class AttendanceController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly CurrentUserService _currentUser;

        public AttendanceController(AppDbContext db, CurrentUserService currentUser)
        {
            _db = db;
            _currentUser = currentUser;
        }

        // Helper: resolves which Employee record this action applies to.
        // - No employeeId given -> always the caller's own employee record.
        // - employeeId given AND it matches the caller's own record -> allowed for anyone.
        // - employeeId given AND it belongs to someone else -> only Admin/HRManager may proceed.
        private async Task<Employee?> ResolveEmployeeAsync(int? requestedEmployeeId)
        {
            var own = await _db.Employees.FirstOrDefaultAsync(e =>
                e.TenantId == _currentUser.TenantId && e.UserId == _currentUser.UserId);

            // No employeeId specified, or it matches their own record -> always allowed
            if (!requestedEmployeeId.HasValue || (own != null && own.Id == requestedEmployeeId.Value))
                return own;

            // A different employeeId was specified -> only Admin/HRManager may act on someone else's behalf
            if (_currentUser.Role != "Admin" && _currentUser.Role != "HRManager")
                return null;

            return await _db.Employees.FirstOrDefaultAsync(e =>
                e.TenantId == _currentUser.TenantId && e.Id == requestedEmployeeId.Value);
        }

        // POST /api/attendance/check-in
        [HttpPost("check-in")]
        public async Task<ActionResult<AttendanceResponse>> CheckIn(CheckInRequest request)
        {
            var employee = await ResolveEmployeeAsync(request.EmployeeId);
            if (employee == null)
                return BadRequest("Employee not found or you don't have permission to check in on their behalf.");

            var today = DateTime.UtcNow.Date;

            var existing = await _db.AttendanceRecords
                .FirstOrDefaultAsync(a => a.EmployeeId == employee.Id && a.Date == today);

            if (existing != null)
                return BadRequest("Already checked in today.");

            var attendance = new Attendance
            {
                EmployeeId = employee.Id,
                Date = today,
                CheckIn = DateTime.UtcNow.TimeOfDay,
                Status = AttendanceStatus.Present
            };
            _db.AttendanceRecords.Add(attendance);
            await _db.SaveChangesAsync();

            return Ok(new AttendanceResponse
            {
                Id = attendance.Id,
                EmployeeId = employee.Id,
                EmployeeName = employee.FullName,
                Date = attendance.Date,
                CheckIn = attendance.CheckIn,
                CheckOut = attendance.CheckOut,
                Status = attendance.Status.ToString()
            });
        }

        // POST /api/attendance/check-out
        [HttpPost("check-out")]
        public async Task<ActionResult<AttendanceResponse>> CheckOut(CheckOutRequest request)
        {
            var employee = await ResolveEmployeeAsync(request.EmployeeId);
            if (employee == null)
                return BadRequest("Employee not found or you don't have permission to check out on their behalf.");

            var today = DateTime.UtcNow.Date;

            var existing = await _db.AttendanceRecords
                .FirstOrDefaultAsync(a => a.EmployeeId == employee.Id && a.Date == today);

            if (existing == null)
                return BadRequest("You haven't checked in today.");

            if (existing.CheckOut != null)
                return BadRequest("Already checked out today.");

            existing.CheckOut = DateTime.UtcNow.TimeOfDay;
            await _db.SaveChangesAsync();

            return Ok(new AttendanceResponse
            {
                Id = existing.Id,
                EmployeeId = employee.Id,
                EmployeeName = employee.FullName,
                Date = existing.Date,
                CheckIn = existing.CheckIn,
                CheckOut = existing.CheckOut,
                Status = existing.Status.ToString()
            });
        }

        // GET /api/attendance/my?from=2026-07-01&to=2026-07-31
        [HttpGet("my")]
        public async Task<ActionResult<List<AttendanceResponse>>> GetMyAttendance(DateTime? from, DateTime? to)
        {
            var employee = await _db.Employees.FirstOrDefaultAsync(e =>
                e.TenantId == _currentUser.TenantId && e.UserId == _currentUser.UserId);

            if (employee == null)
                return NotFound("No employee profile linked to this account.");

            var query = _db.AttendanceRecords.Where(a => a.EmployeeId == employee.Id);

            if (from.HasValue) query = query.Where(a => a.Date >= from.Value.Date);
            if (to.HasValue) query = query.Where(a => a.Date <= to.Value.Date);

            var records = await query
                .OrderByDescending(a => a.Date)
                .Select(a => new AttendanceResponse
                {
                    Id = a.Id,
                    EmployeeId = a.EmployeeId,
                    EmployeeName = employee.FullName,
                    Date = a.Date,
                    CheckIn = a.CheckIn,
                    CheckOut = a.CheckOut,
                    Status = a.Status.ToString()
                })
                .ToListAsync();

            return Ok(records);
        }

        // GET /api/attendance?date=2026-07-21   (Admin/HRManager: whole company for a day)
        [HttpGet]
        [Authorize(Roles = "Admin,HRManager")]
        public async Task<ActionResult<List<AttendanceResponse>>> GetAll(DateTime? date)
        {
            var targetDate = (date ?? DateTime.UtcNow).Date;

            var records = await _db.AttendanceRecords
                .Include(a => a.Employee)
                .Where(a => a.Employee!.TenantId == _currentUser.TenantId && a.Date == targetDate)
                .Select(a => new AttendanceResponse
                {
                    Id = a.Id,
                    EmployeeId = a.EmployeeId,
                    EmployeeName = a.Employee!.FullName,
                    Date = a.Date,
                    CheckIn = a.CheckIn,
                    CheckOut = a.CheckOut,
                    Status = a.Status.ToString()
                })
                .ToListAsync();

            return Ok(records);
        }

        // POST /api/attendance/mark  (Admin/HRManager manually marks a status, e.g. Absent)
        [HttpPost("mark")]
        [Authorize(Roles = "Admin,HRManager")]
        public async Task<ActionResult<AttendanceResponse>> MarkAttendance(MarkAttendanceRequest request)
        {
            var employee = await _db.Employees.FirstOrDefaultAsync(e =>
                e.TenantId == _currentUser.TenantId && e.Id == request.EmployeeId);

            if (employee == null)
                return NotFound("Employee not found.");

            if (!Enum.TryParse<AttendanceStatus>(request.Status, true, out var statusEnum))
                return BadRequest("Invalid status. Use Present, Absent, Late, or HalfDay.");

            var date = request.Date.Date;

            var record = await _db.AttendanceRecords
                .FirstOrDefaultAsync(a => a.EmployeeId == employee.Id && a.Date == date);

            if (record == null)
            {
                record = new Attendance
                {
                    EmployeeId = employee.Id,
                    Date = date,
                    Status = statusEnum
                };
                _db.AttendanceRecords.Add(record);
            }
            else
            {
                record.Status = statusEnum;
            }

            await _db.SaveChangesAsync();

            return Ok(new AttendanceResponse
            {
                Id = record.Id,
                EmployeeId = employee.Id,
                EmployeeName = employee.FullName,
                Date = record.Date,
                CheckIn = record.CheckIn,
                CheckOut = record.CheckOut,
                Status = record.Status.ToString()
            });
        }
    }
}