using System.Security.Claims;
using backend.Models;
using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

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

                var agCacamba = await _context.Cacamba
                    .FirstOrDefaultAsync(c =>c.Id == agendamento.Cacamba.Id);

                var preco = await _context.Preco
                    .FirstOrDefaultAsync(a => a.Tamanho == agCacamba.Tamanho);

                var dias = (agendamento.DataFinal.Date - agendamento.DataInicial.Date).Days;

                var valorTotal = preco.Valor * dias;

                var novoPagamento = new Pagamento
                {
                    Valor = valorTotal,
                    TipoPagemento = pagamento.TipoPagamento,
                };

                if(novoPagamento.TipoPagemento == Enum.PagamentoTypeEnum.Especie)
                    {
                        novoPagamento.StatusPagemento = Enum.PagamentoStatusEnum.Processando;
                    }
                else    
                    {
                        novoPagamento.StatusPagemento = Enum.PagamentoStatusEnum.Criado;
                    }

                _context.Pagamento.Add(novoPagamento);
                await _context.SaveChangesAsync();

                agendamento.StatusAgendamento = Enum.AgendamentoStatus.Processando;
                agendamento.Pagamento = novoPagamento;
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