using System.Security.Claims;

namespace HRManagement.API.Services
{
    public class CurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public int TenantId
        {
            get
            {
                var value = _httpContextAccessor.HttpContext?.User
                    .FindFirst("TenantId")?.Value;
                return int.TryParse(value, out var id) ? id : 0;
            }
        }

        public int UserId
        {
            get
            {
                var value = _httpContextAccessor.HttpContext?.User
                    .FindFirst(ClaimTypes.NameIdentifier)?.Value;
                return int.TryParse(value, out var id) ? id : 0;
            }
        }

        public string Role =>
            _httpContextAccessor.HttpContext?.User
                .FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
    }
}