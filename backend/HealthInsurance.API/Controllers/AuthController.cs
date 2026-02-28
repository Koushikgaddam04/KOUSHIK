using HealthInsurance.Application.DTOs;
using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;
using HealthInsurance.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthInsurance.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;

    public AuthController(IUserRepository userRepository, IAuthService authService)
    {
        _userRepository = userRepository;
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
        if (existingUser != null)
        {
            return BadRequest("User with this email already exists.");
        }

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            // FORCE the role to Customer regardless of what is sent in the DTO
            Role = UserRole.Customer
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new { message = "Registration successful as a Customer!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        // 1. Fetch user from DB
        var user = await _userRepository.GetByEmailAsync(dto.Email);

        // 2. Validate User and Password
        // Feature C: GetByEmailAsync already checks if IsActive is true
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid email or password.");
        }

        // 3. Generate JWT Token
        var token = _authService.GenerateToken(user);

        // 4. Return the Token to the frontend (Angular)
        return Ok(new
        {
            Token = token,
            UserEmail = user.Email,
            UserRole = user.Role.ToString()
        });
    }

    [Authorize(Roles = "Admin")] // Only someone with an Admin JWT can call this
    [HttpPost("admin/add-staff")]
    public async Task<IActionResult> AddStaff(RegisterDto dto)
    {
        var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
        if (existingUser != null)
        {
            return BadRequest("Staff member already exists.");
        }

        var staff = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = (UserRole)dto.RoleId // Here, the Admin decides the role
        };

        await _userRepository.AddAsync(staff);
        await _userRepository.SaveChangesAsync();

        return Ok(new { message = $"Staff member added successfully as {staff.Role}!" });
    }
}