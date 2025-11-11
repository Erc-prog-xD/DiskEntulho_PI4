using System.Security.Claims;
using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.PagamentoService
{
    public class PagamentoService : IPagamentoInterface
    {
        private readonly AppDbContext _context; 
        
        public PagamentoService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Response<Agendamento>> AdicionarPagamento(AddPagementoDTO pagamento)
        {
            Response<Agendamento> response = new Response<Agendamento>();
            try
            {
                var agendamento = await _context.Agendamento
                    .Include(a => a.Pagamento)
                    .FirstOrDefaultAsync(a => a.Id == pagamento.idAgendamento && a.DeletionDate == null);

                if (agendamento == null)
                {
                    response.Mensage = "Agendamento não encontrado";
                    response.Status = false;
                    response.Dados = null;
                    return response;
                }

                Pagamento novoPagamento = new Pagamento
                {
                    Valor = pagamento.Valor,
                    TipoPagemento = pagamento.TipoPagemento
                };

                agendamento.Pagamento = novoPagamento;
                agendamento.StatusAgendamento = Enum.AgendamentoStatus.Processando;
                _context.Add(novoPagamento);
                _context.Update(agendamento);
                await _context.SaveChangesAsync();

                response.Mensage = "Pagamento adicionado ao agendamento";
                response.Status = true;
                response.Dados = agendamento;
            }
            catch
            {
                response.Mensage = "Erro ao adicionar pagamento";
                response.Status = false;
                response.Dados = null;
                return response;
            }
        return response;
        }
    }
}