using HealthInsurance.Application.DTOs;
using HealthInsurance.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace HealthInsurance.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatbotController(IChatbotService chatbotService) : ControllerBase
{
    private readonly IChatbotService _chatbotService = chatbotService;

    [HttpPost("ask")]
    public async Task<IActionResult> Ask([FromBody] ChatRequest request)
    {
        if (string.IsNullOrEmpty(request.Message))
        {
            return BadRequest("Message cannot be empty.");
        }

        var response = await _chatbotService.GetChatResponseAsync(request.Message);
        return Ok(new { Response = response });
    }
}
