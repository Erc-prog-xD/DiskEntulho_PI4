using Microsoft.AspNetCore.Mvc;

using Backend.Services.PagamentoService;
using Microsoft.AspNetCore.Authorization;
using Backend.Dto;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PagamentoController : ControllerBase
    {
        private readonly IPagamentoInterface _pagamentoService;

        public PagamentoController(IPagamentoInterface pagamentoService)
        {
            _pagamentoService = pagamentoService;
        }

        [Authorize]
        [HttpPost("AddPagamento")]
        public async Task<ActionResult> AdicionarPagamento(AddPagementoDTO pagamento)
        {
            var response = await _pagamentoService.AdicionarPagamento(pagamento);
            return Ok(response);
        }
    }
}