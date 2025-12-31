using Microsoft.AspNetCore.Mvc;

using Backend.Services.CacambaService;
using Backend.Dto;
using Microsoft.AspNetCore.Authorization;
namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CacambaController : ControllerBase
    {
        private readonly CacambaService _cacambaService;

        public CacambaController(CacambaService cacambaService)
        {
            _cacambaService = cacambaService;
        }
        
        [Authorize(Roles = "Admin,Client")]
        [HttpGet("CacambasDisponiveis")]
        public async Task<IActionResult> CacambasDisponiveis(DateTime inicio, DateTime fim)
        {
            var result = await _cacambaService.CacambasDisponiveis(inicio, fim);
            return Ok(result);
        }

        [Authorize(Roles = "Admin,Client")]
        [HttpGet("ListarTodos")]
        public async Task<ActionResult> ListarTodos()
        {
            var result = await _cacambaService.ListarTodos();
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("CadastrarCacamba")]
        public async Task<ActionResult> CadastrarCacamba(CacambaDTO body)
        {
            var response = await _cacambaService.Cadastrar(body);
            return Ok(response);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Deletar(int id)
        {
            var deleted = await _cacambaService.Deletar(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
        
        [Authorize(Roles = "Admin,Client")]
        [HttpGet("{id}")]
        public async Task<ActionResult> ObterPorId(int id)
        {
            var result = await _cacambaService.ObterPorId(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

    }
}