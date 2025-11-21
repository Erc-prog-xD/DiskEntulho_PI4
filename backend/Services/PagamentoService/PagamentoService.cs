
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
                if (pagamento.TipoPagamento == Enum.PagamentoTypeEnum.Pix)
                    {
                        var(orderId, qrCodeLink)= await _pagBankService.CriarCobrancaPixAsync(agendamento.Client, valorTotal, $"Agendamento-{agendamento.Id}",agendamento.Cacamba);
                        novoPagamento.PagBankOrderId = orderId;
                        novoPagamento.PagBankQrCode = qrCodeLink;
                        novoPagamento.StatusPagemento = Enum.PagamentoStatusEnum.Criado;
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

                await _notificationService.CriarNotificacaoAsync(
                    agendamento.Id, 
                    agendamento.Client.Id,
                    "Pagamento adicionado ao agendamento, agora estamos processando seu agendamento",
                    Enum.AgendamentoStatus.Processando
                );

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