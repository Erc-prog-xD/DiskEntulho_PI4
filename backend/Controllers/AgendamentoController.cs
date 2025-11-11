using Microsoft.AspNetCore.Mvc;

using Backend.Dto;
using Backend.Services.AgendamentoService;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgendamentoController : ControllerBase
    {
        private readonly IAgendamentoInterface _agendamentoService;

        public AgendamentoController(IAgendamentoInterface agendamentoService)
        {
            _agendamentoService = agendamentoService;
        }

        [Authorize]
        [HttpPost("CadastrarAgendamento")]
        public async Task<ActionResult> CadastrarAgendamento(AgendamentoDTO agendamentoBody)
        {
            var response = await _agendamentoService.CadastrarAgendamento(agendamentoBody);
            return Ok(response);
        }


    }
}