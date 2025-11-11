using System.Security.Claims;
using Backend.Data;
using Backend.Dto;
using Backend.Models;

namespace Backend.Services.PagamentoService
{
    public class PagamentoService : Pagamento
    {
        private readonly AppDbContext _context; 
        // public async Task<Response<Pagamento>> AdicionarPagamento(AddPagementoDTO pg)
        // {
        //     Response<Pagamento> response = new Response<Pagamento>();
        //     try
        //     {
        //         Pagamento novoPagamento = new Pagamento
        //         {
        //             Valor = pg.Valor,
        //             TipoPagemento = pg.TipoPagemento
        //         };
        //         _context.Add(novoPagamento);
        //         await _context.SaveChangesAsync();

        //         response.Mensage = "Pagamento adicionado!";


        //     }
        //     catch
        //     {
        //         response.Mensage = "Erro ao adicionar pagamento";
        //         response.Status = false;
        //         response.Dados = null;
        //         return response;
        //     }
        //     return response;
        //     }
    }
}