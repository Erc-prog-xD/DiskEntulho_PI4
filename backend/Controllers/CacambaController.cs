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
        private readonly ICacambaInterface _cacambaInterface;

        public CacambaController(ICacambaInterface cacambaInterface)
        {
            _cacambaInterface = cacambaInterface;
        }
        
        [Authorize(Roles = "Admin,Client")]
        [HttpGet("CacambasDisponiveis")]
        public async Task<IActionResult> CacambasDisponiveis(DateTime inicio, DateTime fim)
        {
            var result = await _cacambaInterface.CacambasDisponiveis(inicio, fim);
            return Ok(result);
        }

        [Authorize(Roles = "Admin,Client")]
        [HttpGet("ListarTodasCacambas")]
        public async Task<ActionResult> ListarTodos()
        {
            var result = await _cacambaInterface.ListarTodos();
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("CadastrarCacamba")]
        public async Task<ActionResult> CadastrarCacamba(CacambaDTO body)
        {
            var response = await _cacambaInterface.Cadastrar(body);
            return Ok(response);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Deletar(int id)
        {
            var response = await _cacambaInterface.Deletar(id);
            return Ok(response);
        }
        
        [Authorize(Roles = "Admin,Client")]
        [HttpGet("{id}")]
        public async Task<ActionResult> ObterPorId(int id)
        {
            var result = await _cacambaInterface.ObterPorId(id);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("AtualizarCacamba/{id}")]
        public async Task<IActionResult> Atualizar(int id, CacambaUpdateDTO dto)
        {
            var response = await _cacambaInterface.Atualizar(id, dto);
            return Ok(response);
        }

    }
}