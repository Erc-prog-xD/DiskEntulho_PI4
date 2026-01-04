using Microsoft.AspNetCore.Mvc;

using Backend.Services.PagamentoService;
using Microsoft.AspNetCore.Authorization;
using Backend.Dto;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Client")]
    public class PagamentoController : ControllerBase
    {
        private readonly IPagamentoInterface _pagamentoService;

        public PagamentoController(IPagamentoInterface pagamentoService)
        {
            _pagamentoService = pagamentoService;
        }
        
        [HttpPost("AddPagamento")]
        public async Task<ActionResult> AdicionarPagamento(AddPagementoDTO pagamento)
        {
            var response = await _pagamentoService.AdicionarPagamento(pagamento);
            return Ok(response);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("AprovarPagamentoEspecie/{agendamentoId}")]
        public async Task<ActionResult> AprovarPagamentoEspecie(int agendamentoId)
        {
            var response = await _pagamentoService.AprovarPagamentoEspecie(agendamentoId);
            return Ok(response);
        }
    }
}