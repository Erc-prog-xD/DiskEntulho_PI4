using Microsoft.AspNetCore.Mvc;

using Backend.Dto;
using Backend.Services.AgendamentoService;
namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AgendamentoController : ControllerBase
    {
        private readonly AgendamentoService _agendamentoService;

        public AgendamentoController(AgendamentoService agendamentoService)
        {
            _agendamentoService = agendamentoService;
        }

        [HttpPost("CadastrarAgendamento")]
        public async Task<ActionResult> CadastrarAgendamento(AgendamentoDTO agendamentoBody)
        {
            var response = await _agendamentoService.Cadastrar(agendamentoBody);
            return Ok(response);
        }

    }
}