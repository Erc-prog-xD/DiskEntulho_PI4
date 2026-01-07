using Microsoft.AspNetCore.Mvc;
using Backend.Services.PrecoService;
using Backend.DTO;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PrecoController : ControllerBase
    {
        private readonly IPrecoInterface _precoInterface;

        public PrecoController(IPrecoInterface precoInterface)
        {
            _precoInterface = precoInterface;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("CadastrarPreco")]
        public async Task<ActionResult> CadastrarPreco(PrecoDTO precoBody)
        {
            var response = await _precoInterface.CadastrarPreco(precoBody);
            return Ok(response);
        }
    }
}