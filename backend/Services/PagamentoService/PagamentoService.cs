
using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Backend.Services.NotificationService;
using Backend.Services.PagBank;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.PagamentoService
{
    public class PagamentoService : IPagamentoInterface
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly PagBankService _pagBankService;

        public PagamentoService(AppDbContext context, INotificationService notificationService, PagBankService pagBankService)
        {
            _context = context;
            _notificationService = notificationService;
            _pagBankService = pagBankService;
        }
        public async Task<Response<Agendamento>> AdicionarPagamento(AddPagementoDTO pagamento)
        {
            var response = new Response<Agendamento>();
            try
            {
                // Buscar agendamento válido
                var agendamento = await _context.Agendamento
                    .Include(a => a.Pagamento)
                    .Include(a => a.Client)
                    .Include(a => a.Cacamba)
                    .FirstOrDefaultAsync(a => a.Id == pagamento.idAgendamento && a.DeletionDate == null);

                if (agendamento == null || agendamento.Pagamento != null)
                {
                    return new Response<Agendamento>
                    {
                        Mensagem = "Agendamento não encontrado ou já possui pagamento",
                        Status = false
                    };
                }

                var agCacamba = await _context.Cacamba
                    .FirstOrDefaultAsync(c =>c.Id == agendamento.Cacamba.Id);
                
                if( agCacamba == null)
                {
                    response.Mensagem = "Cacamba não encontrada";
                    response.Status = false;
                    response.Dados = null;
                    return response;
                }

                var preco = await _context.Preco
                    .FirstOrDefaultAsync(a => a.Tamanho == agCacamba.Tamanho);

                if(preco == null)
                {
                    response.Mensagem = "Preco não encontrado na tabela";
                    response.Status = false;
                    response.Dados = null;
                    return response;
                }
                
                var dias = (agendamento.DataFinal.Date - agendamento.DataInicial.Date).Days;

                var valorTotal = preco.Valor * dias;

                var novoPagamento = new Pagamento
                {
                    Valor = valorTotal,
                    TipoPagamento = pagamento.TipoPagamento,
                };

                if(novoPagamento.TipoPagamento == Enum.PagamentoTypeEnum.Especie)
                    {
                        novoPagamento.StatusPagamento = Enum.PagamentoStatusEnum.Processando;
                    }
                else if (novoPagamento.TipoPagamento == Enum.PagamentoTypeEnum.Pix)
                    {
                        var(orderId, qrCodeLink)= await _pagBankService.CriarCobrancaPixAsync(
                            agendamento.Client, valorTotal, $"Agendamento-{agendamento.Id}",agendamento.Cacamba
                        );
                        novoPagamento.PagBankOrderId = orderId;
                        novoPagamento.PagBankQrCode = qrCodeLink;
                        novoPagamento.StatusPagamento = Enum.PagamentoStatusEnum.Criado;
                    }
                else    
                    {
                        novoPagamento.StatusPagamento = Enum.PagamentoStatusEnum.Criado;
                    }

                _context.Pagamento.Add(novoPagamento);
                await _context.SaveChangesAsync();

                agendamento.StatusAgendamento = Enum.AgendamentoStatus.Processando;
                agendamento.Pagamento = novoPagamento;
                _context.Agendamento.Update(agendamento);
                await _context.SaveChangesAsync();

                await _notificationService.CriarNotificacaoAsync(
                    agendamento.Id, 
                    agendamento.Client.Id,
                    "Pagamento adicionado ao agendamento, agora estamos processando seu agendamento",
                    Enum.AgendamentoStatus.Processando
                );

                return new Response<Agendamento>
                {
                    Mensagem = "Pagamento adicionado ao agendamento",
                    Status = true,
                    Dados = agendamento
                };
            }
            catch (Exception ex)
            {
                return new Response<Agendamento>
                {
                    Mensagem = $"Erro ao adicionar pagamento: {ex.Message}",
                    Status = false
                };
            }
        }

    }
}