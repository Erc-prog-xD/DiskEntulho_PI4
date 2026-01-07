


using Backend.Dto;
using Backend.DTO;
using Backend.Services.AdminService;
using Backend.Services.PrecoService;
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
        private readonly IPrecoInterface _precoInterface; // 2. Declaramos a interface aqui

        // 3. Atualizamos o construtor para receber as DUAS interfaces
        public AdminController(IAdminInterface adminService, IPrecoInterface precoInterface)
        {
            _adminService = adminService;
            _precoInterface = precoInterface; // 4. Injetamos o serviço
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

        // 5. Agora o método funciona pois _precoInterface existe!
        [HttpPost("CadastrarPreco")]
        public async Task<ActionResult> CadastrarPreco(PrecoDTO precoBody)
        {
            var response = await _precoInterface.CadastrarPreco(precoBody);
            return Ok(response);
        }

    }


}