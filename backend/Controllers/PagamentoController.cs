using Microsoft.AspNetCore.Mvc;

using Backend.Services.PagamentoService;
using Microsoft.AspNetCore.Authorization;
using Backend.Models;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PagamentoController : ControllerBase
    {
        private readonly PagamentoService _pagamentoService;

        public PagamentoController(PagamentoService pagamentoService)
        {
            _pagamentoService = pagamentoService;
        }

        // [Authorize]
        // [HttpPost("CadastrarPagamento")]
        // public async Task<ActionResult> CadastrarPagamento(Pagamento pagamentoBody)
        // {
        //     var response = await _pagamentoService.CadastrarPagamento(pagamentoBody);
        //     return Ok(response);
        // }
    }
}