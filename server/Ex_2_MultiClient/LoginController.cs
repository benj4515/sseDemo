using dataaccess.Service;
using dataaccess.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

namespace server.Ex_2_MultiClient;

[ApiController]
[Route("api/[controller]")]
public class LoginController: ControllerBase

{
    private readonly TokenService _tokenService;
    private readonly IAuthService _authService;
    

    public LoginController(TokenService tokenService, IAuthService authService, IUserService userService)
    {
        _tokenService = tokenService;
        _authService = authService;
        
    }
/*
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {

        var isValid = await _authService.verifyPasswordByEmailAsync(request.Username, request.Password);

        if (!isValid)
            return Unauthorized("Invalid credentials");

        var token = _tokenService.CreateToken(_authService.GetUserByEmailAsync(request.Username).Result);

        return Ok(new { token });

    }
    */
    /*
    [HttpPost("User-change-password")]
    [Authorize(Roles = "Bruger, Administrator")]
    public async Task<IActionResult> UserChangePassword([FromQuery]string userId,[FromQuery] string oldPassword, [FromQuery] string newPassword)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(oldPassword) || string.IsNullOrWhiteSpace(newPassword))
            return BadRequest("Alle felter skal udfyldes.");

        try
        {
            await _authService.UpdateUserPasswordAsync(userId, oldPassword, newPassword);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
    */

    /*
    [HttpPost("admin-reset-password/{userId}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> AdminResetPassword([FromRoute] string userId, [FromBody] ResetPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(userId) || dto is null)
            return BadRequest("UserId and body are required.");

        try
        {
            await _authService.AdminResetUserPasswordAsync(userId, dto.NewPassword);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
    */
}