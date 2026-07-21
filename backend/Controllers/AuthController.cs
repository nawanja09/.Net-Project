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
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly JwtService _jwtService;

        public AuthController(AppDbContext db, JwtService jwtService)
        {
            _db = db;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            // Check if email is already used anywhere (simple global check for now)
            var emailExists = await _db.Users.AnyAsync(u => u.Email == request.Email);
            if (emailExists)
                return BadRequest("An account with this email already exists.");

            // Create the tenant (company) first
            var tenant = new Tenant
            {
                CompanyName = request.CompanyName,
                SubscriptionPlan = "Free"
            };
            _db.Tenants.Add(tenant);
            await _db.SaveChangesAsync(); // saves so tenant.Id is generated

            // Create the user as Admin of their new company
            var user = new User
            {
                TenantId = tenant.Id,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = UserRole.Admin
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // Create a matching Employee profile for this admin user
            var employee = new Employee
            {
                TenantId = tenant.Id,
                UserId = user.Id,
                FullName = request.FullName
            };
            _db.Employees.Add(employee);
            await _db.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                Email = user.Email,
                Role = user.Role.ToString(),
                CompanyName = tenant.CompanyName
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var user = await _db.Users
                .Include(u => u.Tenant)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized("Invalid email or password.");

            var token = _jwtService.GenerateToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                Email = user.Email,
                Role = user.Role.ToString(),
                CompanyName = user.Tenant?.CompanyName ?? string.Empty
            });
        }
    }
}