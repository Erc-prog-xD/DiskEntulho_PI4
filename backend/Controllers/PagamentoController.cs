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

        [HttpGet("CalcularValorAgendamento/{idAgendamento}")]
        public async Task<ActionResult> CalcularValorAgendamento(int idAgendamento)
        {
            var response = await _pagamentoService.CalcularValorAgendamento(idAgendamento);
            return Ok(response);
        }

        [HttpGet("PagamentoPorId/{idPagamento:int}")]
        public async Task<ActionResult> PagamentoPorId(int idPagamento)
        {
            var response = await _pagamentoService.ObterPagamentoPorId(idPagamento);
            return Ok(response);
        }

    }
}