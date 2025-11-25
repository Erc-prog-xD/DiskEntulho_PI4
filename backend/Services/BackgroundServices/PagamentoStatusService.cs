using Backend.Data;
using Backend.Services.NotificationService;
using Backend.Services.PagBank;
using Microsoft.EntityFrameworkCore;
using RestSharp;
using System.Text.Json;

namespace Backend.Services.BackgroundServices
{
    public class PagamentoStatusService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly PagBankService _pagBankService;
        private readonly TimeSpan _interval = TimeSpan.FromMinutes(1); // interval between checks

        public PagamentoStatusService(IServiceScopeFactory scopeFactory, PagBankService pagBankService)
        {
            _scopeFactory = scopeFactory;
            _pagBankService = pagBankService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();


                    // Buscar pagamentos que ainda não foram pagos
                    var pagamentos = await context.Pagamento
                     .Where(p => (p.StatusPagemento == Enum.PagamentoStatusEnum.Criado ||
                                  p.StatusPagemento == Enum.PagamentoStatusEnum.Processando) &&
                                  p.TipoPagemento == Enum.PagamentoTypeEnum.Pix)
                     .ToListAsync(stoppingToken);



                    foreach (var pagamento in pagamentos)
                    {
                        // Consultar status no PagBank
                        var status = await _pagBankService.ConsultarStatusPagBankAsync(pagamento.PagBankOrderId);
                        var agendamento = await context.Agendamento
                            .Include(a => a.Client)
                            .FirstOrDefaultAsync(a => a.Pagamento.Id == pagamento.Id && a.DeletionDate == null, stoppingToken);

                        if (status != null)
                        {
                            switch (status)
                            {
                                
                                case "PAID":
                                    pagamento.StatusPagemento = Enum.PagamentoStatusEnum.Aprovado;

                                    await notificationService.CriarNotificacaoAsync(
                                    agendamento.Id,
                                    agendamento.Client.Id,
                                    "Verificamos o pagamento e ele foi aprovado! Seu agendamento está CONFIRMADO",
                                    Enum.AgendamentoStatus.Confirmado);
                                    agendamento.StatusAgendamento = Enum.AgendamentoStatus.Confirmado;

                                    break;
                                case "CANCELLED":
                                    pagamento.StatusPagemento = Enum.PagamentoStatusEnum.Rejeitado;
                                    await notificationService.CriarNotificacaoAsync(
                                    agendamento.Id,
                                    agendamento.Client.Id,
                                    "Verificamos o pagamento e ele foi cancelado! Seu agendamento está REJEITADO",
                                    Enum.AgendamentoStatus.Rejeitado);
                                    agendamento.StatusAgendamento = Enum.AgendamentoStatus.Rejeitado;
                                    break;
                                case "WAITING":
                                    pagamento.StatusPagemento = Enum.PagamentoStatusEnum.Processando;
                                    await notificationService.CriarNotificacaoAsync(
                                    agendamento.Id,
                                    agendamento.Client.Id,
                                    "Verificamos o pagamento e ele está em ESPERA! Seu agendamento está PROCESSANDO",
                                    Enum.AgendamentoStatus.Processando);
                                    break;
                                // adicione outros status conforme necessário
                            }
                            context.Agendamento.Update(agendamento);
                            context.Pagamento.Update(pagamento);
                        }
                    }

                    await context.SaveChangesAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro ao atualizar status de pagamentos: {ex.Message}");
                }

                await Task.Delay(_interval, stoppingToken);
            }
        }
    }
}
