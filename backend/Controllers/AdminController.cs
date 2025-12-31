


using Backend.Dto;
using Backend.Services.AdminService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{   
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminInterface _adminService;

        public AdminController(IAdminInterface adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("ListarAgendamentosEmEspecie")]
        public async Task<ActionResult> ListarAgendamentosEmEspecie([FromQuery] int page = 1, [FromQuery] int pageSize = 20)        
        {
            var response = await _adminService.ListarAgendamentosEmEspecie(page, pageSize);
            return Ok(response);
        }

        [HttpPut("ConfirmarAgendamento/{idAgendamento}")]
        public async Task<ActionResult> ConfirmarAgendamento(int idAgendamento, bool ConfirmarAgendamento)
        {
            var response = await _adminService.ConfirmarAgendamento(idAgendamento, ConfirmarAgendamento);

            return Ok(response);
        }

        [HttpDelete("DeletarCliente/{id}")]
        public async Task<ActionResult> DeletarCliente(int id)
        {
            var response = await _adminService.ApagarCliente(id);
            return Ok(response);
        }

        [HttpPost("ReativarCliente/{id}")]
        public async Task<ActionResult> ReativarCliente(int id)
        {
            var response = await _adminService.ReativarCliente(id);
            return Ok(response);
        }
        [HttpGet("ListarTodosAgendamentos")]
        public async Task<ActionResult> ListarAgendamentos([FromQuery] AgendamentoFiltroDTO filtro)
        {
            var response = await _adminService.ListarTodosAgendamentos(filtro);
            return Ok(response);
        }
    }


}