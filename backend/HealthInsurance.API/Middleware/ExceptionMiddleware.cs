using System.Net;
using System.Text.Json;

namespace HealthInsurance.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            // Try to move to the next part of the code (Controller/Service)
            await _next(context);
        }
        catch (Exception ex)
        {
            // If anything fails, we catch it here!
            _logger.LogError(ex, $"Something went wrong: {ex.Message}");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        var result = JsonSerializer.Serialize(new { error = "Internal Server Error", message = ex.Message });
        return context.Response.WriteAsync(result);
    }
}