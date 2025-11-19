using Microsoft.AspNetCore.Mvc;

using Backend.Services.CacambaService;
using Backend.Dto;
using Microsoft.AspNetCore.Authorization;
namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CacambaController : ControllerBase
    {
        private readonly CacambaService _cacambaService;

        public CacambaController(CacambaService cacambaService)
        {
            _cacambaService = cacambaService;
        }
        [Authorize]
        [HttpGet("ListarTodos")]
        public async Task<ActionResult> ListarTodos()
        {
            var result = await _cacambaService.ListarTodos();
            return Ok(result);
        }

        [Authorize]
        [HttpPost("CadastrarCacamba")]
        public async Task<ActionResult> CadastrarCacamba(CacambaDTO body)
        {
            var response = await _cacambaService.Cadastrar(body);
            return Ok(response);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Deletar(int id)
        {
            var deleted = await _cacambaService.Deletar(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult> ObterPorId(int id)
        {
            var result = await _cacambaService.ObterPorId(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

    }
}