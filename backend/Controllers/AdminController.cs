


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
    }


}