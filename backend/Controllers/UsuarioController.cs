using Backend.Dto;
using Backend.Models;
using Backend.Services.UsuarioService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Client")]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioInterface _usuarioService;

        public UsuarioController(IUsuarioInterface usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpGet("VisualizarPerfil")]
        public async Task<ActionResult> Me()
        {
            int usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            Response<UsuarioResponseDTO> response = await _usuarioService.ObterMe(usuarioId);
            return Ok(response);
        }

        [HttpPut("AtualizarPerfil")]
        public async Task<ActionResult> AtualizarMe(UsuarioUpdateDTO dto)
        {
            int usuarioId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            Response<UsuarioResponseDTO> response = await _usuarioService.AtualizarMe(usuarioId, dto);
            return Ok(response);
        }
    }
}
