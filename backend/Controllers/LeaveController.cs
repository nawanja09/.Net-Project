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
    public class LeaveController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly CurrentUserService _currentUser;

        public LeaveController(AppDbContext db, CurrentUserService currentUser)
        {
            _db = db;
            _currentUser = currentUser;
        }

        private async Task<Employee?> GetOwnEmployeeAsync()
        {
            return await _db.Employees
                .FirstOrDefaultAsync(e => e.TenantId == _currentUser.TenantId
                                        && e.UserId == _currentUser.UserId);
        }

        // POST /api/leave
        // Any employee submits a leave request for themselves.
        [HttpPost]
        public async Task<ActionResult<LeaveRequestResponse>> Create(CreateLeaveRequest request)
        {
            if (request.EndDate < request.StartDate)
                return BadRequest("End date cannot be before start date.");

            var own = await GetOwnEmployeeAsync();
            if (own == null) return BadRequest("No employee profile found for your account.");

            var days = (request.EndDate.Date - request.StartDate.Date).Days + 1;

            // Check balance if one exists for this leave type
            var balance = await _db.LeaveBalances.FirstOrDefaultAsync(
                b => b.EmployeeId == own.Id && b.LeaveType == request.LeaveType);

            if (balance != null && (balance.TotalDays - balance.UsedDays) < days)
                return BadRequest($"Insufficient {request.LeaveType} leave balance. " +
                                   $"Remaining: {balance.TotalDays - balance.UsedDays} day(s).");

            var leave = new LeaveRequest
            {
                EmployeeId = own.Id,
                StartDate = request.StartDate.Date,
                EndDate = request.EndDate.Date,
                Reason = request.Reason,
                Status = LeaveStatus.Pending
            };
            _db.LeaveRequests.Add(leave);
            await _db.SaveChangesAsync();

            return Ok(new LeaveRequestResponse
            {
                Id = leave.Id,
                EmployeeId = own.Id,
                EmployeeName = own.FullName,
                StartDate = leave.StartDate,
                EndDate = leave.EndDate,
                DaysRequested = days,
                Reason = leave.Reason,
                Status = leave.Status.ToString()
            });
        }

        // GET /api/leave
        // Employees see only their own; Admin/HR see everyone's (optionally filtered by status).
        [HttpGet]
        public async Task<ActionResult<List<LeaveRequestResponse>>> GetAll([FromQuery] string? status)
        {
            var query = _db.LeaveRequests
                .Include(l => l.Employee)
                .Include(l => l.ApprovedBy)
                .Where(l => l.Employee!.TenantId == _currentUser.TenantId);

            if (_currentUser.Role == "Employee")
            {
                var own = await GetOwnEmployeeAsync();
                if (own == null) return Ok(new List<LeaveRequestResponse>());
                query = query.Where(l => l.EmployeeId == own.Id);
            }

            if (!string.IsNullOrEmpty(status) &&
                Enum.TryParse<LeaveStatus>(status, true, out var statusFilter))
            {
                query = query.Where(l => l.Status == statusFilter);
            }

            var results = await query
                .OrderByDescending(l => l.StartDate)
                .Select(l => new LeaveRequestResponse
                {
                    Id = l.Id,
                    EmployeeId = l.EmployeeId,
                    EmployeeName = l.Employee!.FullName,
                    StartDate = l.StartDate,
                    EndDate = l.EndDate,
                    DaysRequested = (l.EndDate.Date - l.StartDate.Date).Days + 1,
                    Reason = l.Reason,
                    Status = l.Status.ToString(),
                    ApprovedByName = l.ApprovedBy != null ? l.ApprovedBy.Email : null
                })
                .ToListAsync();

            return Ok(results);
        }

        // PUT /api/leave/5/review
        // Admin/HR approve or reject a pending request.
        [HttpPut("{id}/review")]
        [Authorize(Roles = "Admin,HRManager")]
        public async Task<ActionResult<LeaveRequestResponse>> Review(int id, ReviewLeaveRequest request)
        {
            var leave = await _db.LeaveRequests
                .Include(l => l.Employee)
                .FirstOrDefaultAsync(l => l.Id == id && l.Employee!.TenantId == _currentUser.TenantId);

            if (leave == null) return NotFound();

            if (leave.Status != LeaveStatus.Pending)
                return BadRequest("This request has already been reviewed.");

            leave.Status = request.Approve ? LeaveStatus.Approved : LeaveStatus.Rejected;
            leave.ApprovedByUserId = _currentUser.UserId;

            // Deduct from balance only if approved
            if (request.Approve)
            {
                var days = (leave.EndDate.Date - leave.StartDate.Date).Days + 1;
                var balance = await _db.LeaveBalances.FirstOrDefaultAsync(
                    b => b.EmployeeId == leave.EmployeeId);

                if (balance != null)
                {
                    balance.UsedDays += days;
                }
            }

            await _db.SaveChangesAsync();

            return Ok(new LeaveRequestResponse
            {
                Id = leave.Id,
                EmployeeId = leave.EmployeeId,
                EmployeeName = leave.Employee!.FullName,
                StartDate = leave.StartDate,
                EndDate = leave.EndDate,
                DaysRequested = (leave.EndDate.Date - leave.StartDate.Date).Days + 1,
                Reason = leave.Reason,
                Status = leave.Status.ToString()
            });
        }

        // GET /api/leave/balance
        // Employee's own leave balances.
        [HttpGet("balance")]
        public async Task<ActionResult<List<LeaveBalanceResponse>>> GetOwnBalance()
        {
            var own = await GetOwnEmployeeAsync();
            if (own == null) return Ok(new List<LeaveBalanceResponse>());

            var balances = await _db.LeaveBalances
                .Where(b => b.EmployeeId == own.Id)
                .Select(b => new LeaveBalanceResponse
                {
                    LeaveType = b.LeaveType,
                    TotalDays = b.TotalDays,
                    UsedDays = b.UsedDays,
                    RemainingDays = b.TotalDays - b.UsedDays
                })
                .ToListAsync();

            return Ok(balances);
        }

        // GET /api/leave/balance/5
        // Admin/HR view any employee's balance.
        [HttpGet("balance/{employeeId}")]
        [Authorize(Roles = "Admin,HRManager")]
        public async Task<ActionResult<List<LeaveBalanceResponse>>> GetBalanceFor(int employeeId)
        {
            var employee = await _db.Employees
                .FirstOrDefaultAsync(e => e.Id == employeeId && e.TenantId == _currentUser.TenantId);
            if (employee == null) return NotFound();

            var balances = await _db.LeaveBalances
                .Where(b => b.EmployeeId == employeeId)
                .Select(b => new LeaveBalanceResponse
                {
                    LeaveType = b.LeaveType,
                    TotalDays = b.TotalDays,
                    UsedDays = b.UsedDays,
                    RemainingDays = b.TotalDays - b.UsedDays
                })
                .ToListAsync();

            return Ok(balances);
        }

        // POST /api/leave/balance
        // Admin/HR set or top up an employee's leave allowance (e.g. at year start).
        [HttpPost("balance")]
        [Authorize(Roles = "Admin,HRManager")]
        public async Task<IActionResult> SetBalance(SetLeaveBalanceRequest request)
        {
            var employee = await _db.Employees
                .FirstOrDefaultAsync(e => e.Id == request.EmployeeId && e.TenantId == _currentUser.TenantId);
            if (employee == null) return NotFound("Employee not found.");

            var balance = await _db.LeaveBalances.FirstOrDefaultAsync(
                b => b.EmployeeId == request.EmployeeId && b.LeaveType == request.LeaveType);

            if (balance != null)
            {
                balance.TotalDays = request.TotalDays;
            }
            else
            {
                balance = new LeaveBalance
                {
                    EmployeeId = request.EmployeeId,
                    LeaveType = request.LeaveType,
                    TotalDays = request.TotalDays,
                    UsedDays = 0
                };
                _db.LeaveBalances.Add(balance);
            }

            await _db.SaveChangesAsync();
            return Ok();
        }
    }
}