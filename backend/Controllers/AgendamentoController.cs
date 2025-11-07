using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services.AuthService;
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
        public async Task<ActionResult> CadastrarAgendamento(Agendamento agendamentoBody)
        {
            var response = await _agendamentoService.Cadastrar(agendamentoBody);
            return Ok(response);
        }

    }
}