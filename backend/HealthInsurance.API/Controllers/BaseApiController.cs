using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using HealthInsurance.Domain;

namespace HealthInsurance.API.Controllers
{
    public abstract class BaseApiController : Controller
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null)
            {
                UserSession.CurrentUserId = int.Parse(userIdClaim.Value);
            }
            else
            {
                // Fallback for development if not authenticated
                UserSession.CurrentUserId = 1; 
            }
            base.OnActionExecuting(context);
        }
    }
}
