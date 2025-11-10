using Microsoft.AspNetCore.Mvc;

using Backend.Services.CacambaService;
using Backend.Dto;
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

        [HttpPost("CadastrarCacamba")]
        public async Task<ActionResult> CadastrarCacamba(CacambaDTO body)
        {
            var response = await _cacambaService.Cadastrar(body);
            return Ok(response);
        }

    }
}