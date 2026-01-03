using Microsoft.AspNetCore.Mvc;

using Backend.Dto;
using Backend.Services.AgendamentoService;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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
            int clientId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            var response = await _agendamentoService.CadastrarAgendamento(clientId,agendamentoBody);
            return Ok(response);
        }

        [HttpGet("AgendamentosFeitosUsuarioLogado")]
        public async Task<ActionResult> AgendamentosFeitosUsuarioLogado()
        {
            var clientId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            var response = await _agendamentoService.BuscarAgendamentosFeitosUsuarioLogado(clientId);
            return Ok(response);
        }

    }
}