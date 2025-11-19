using System.Security.Claims;
using backend.Models;
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
            var response = new Response<Agendamento>();

            try
            {
                // Buscar agendamento válido
                var agendamento = await _context.Agendamento
                    .Include(a => a.Pagamento)
                    .Include(a => a.Cacamba)
                    .FirstOrDefaultAsync(a => a.Id == pagamento.idAgendamento && a.DeletionDate == null);

                if (agendamento == null || agendamento.Pagamento != null)
                {
                    return new Response<Agendamento>
                    {
                        Mensage = "Agendamento não encontrado ou já possui pagamento",
                        Status = false
                    };
                }

                // Buscar preço da caçamba
                var preco = await _context.Preco
                    .FirstOrDefaultAsync(p => p.codigoCacamba.Id == agendamento.Cacamba.Id);

                if (preco == null)
                {
                    return new Response<Agendamento>
                    {
                        Mensage = "Preço não encontrado para essa caçamba",
                        Status = false
                    };
                }


                // Criar novo pagamento
                var novoPagamento = new Pagamento
                {
                    Valor = preco.Valor,
                    TipoPagemento = pagamento.TipoPagemento
                };
                // Definir status conforme o tipo de pagamento
                if (novoPagamento.TipoPagemento == Enum.PagamentoTypeEnum.Especie)
                {
                    novoPagamento.StatusPagemento = Enum.PagamentoStatusEnum.Processando;
                }

                agendamento.StatusAgendamento = Enum.AgendamentoStatus.Processando;

                // Persistir
                agendamento.Pagamento = novoPagamento;
                _context.Pagamento.Add(novoPagamento);
                _context.Agendamento.Update(agendamento);
                await _context.SaveChangesAsync();

                return new Response<Agendamento>
                {
                    Mensage = "Pagamento adicionado ao agendamento",
                    Status = true,
                    Dados = agendamento
                };
            }
            catch (Exception ex)
            {
                return new Response<Agendamento>
                {
                    Mensage = $"Erro ao adicionar pagamento: {ex.Message}",
                    Status = false
                };
            }
        }

    }
}