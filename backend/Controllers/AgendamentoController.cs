using Microsoft.AspNetCore.Mvc;

using Backend.Dto;
using Backend.Services.AgendamentoService;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Client")]
    public class AgendamentoController : ControllerBase
    {
        private readonly IAgendamentoInterface _agendamentoService;

        public AgendamentoController(IAgendamentoInterface agendamentoService)
        {
            _agendamentoService = agendamentoService;
        }

        [HttpPost("CadastrarAgendamento")]
        public async Task<ActionResult> CadastrarAgendamento(AgendamentoCreateDTO agendamentoBody)
        {
            var response = await _agendamentoService.CadastrarAgendamento(agendamentoBody);
            return Ok(response);
        }

        [HttpGet("AgendamentosFeitos")]
        public async Task<ActionResult> AgendamentosFeitos()
        {
            var response = await _agendamentoService.BuscarAgendamentosFeitos();
            return Ok(response);
        }

    }
}