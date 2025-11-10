using Microsoft.AspNetCore.Mvc;

using Backend.Services.CacambaService;
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
        public async Task<ActionResult> CadastrarCacamba()
        {
            var response = await _cacambaService.Cadastrar();
            return Ok(response);
        }

    }
}