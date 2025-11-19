using backend.DTO;
using backend.Models;
using backend.Services.PrecoService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PrecoController : ControllerBase
    {
        private readonly PrecoService _precoservice;

        public PrecoController(PrecoService precoservice)
        {
            _precoservice = precoservice;
        }

        [HttpPost("CadastrarPrecoCacamba")]
        public async Task<ActionResult> CadastrarPrecoCacamba(PrecoDTO body)
        {
            var response = await _precoservice.CadastrarPrecoCacamba(body);
            return Ok(response);
        }
    }
}