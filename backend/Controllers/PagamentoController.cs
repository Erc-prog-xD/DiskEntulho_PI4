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

        [HttpGet("CalcularValorAgendamento/{IdAgendamento:int}")]
        public async Task<ActionResult> CalcularValorAgendamento(int IdAgendamento)
        {
            var response = await _pagamentoService.CalcularValorAgendamento(IdAgendamento);
            return Ok(response);
        }

        [HttpGet("PagamentoPorId/{IdPagamento:int}")]
        public async Task<ActionResult> PagamentoPorId(int IdPagamento)
        {
            var response = await _pagamentoService.ObterPagamentoPorId(IdPagamento);
            return Ok(response);
        }

    }
}