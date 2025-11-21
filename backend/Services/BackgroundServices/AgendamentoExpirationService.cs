using Backend.Data;
using Backend.Enum;
using Backend.Models;
using Backend.Services.NotificationService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.BackgroundServices
{
    public class AgendamentoExpirationService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        public AgendamentoExpirationService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await VerificarAgendamentosExpirados(stoppingToken);
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }

        private async Task VerificarAgendamentosExpirados(CancellationToken stoppingToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var _context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var limite = DateTime.Now.AddMinutes(-5);

            var agendamentosExpirados = await _context.Agendamento
                .Include(a => a.Client) 
                .Where(a => 
                    a.DeletionDate == null &&
                    a.StatusAgendamento == AgendamentoStatus.Criado &&
                    a.CreationDate <= limite 
                )
                .ToListAsync(stoppingToken);

            foreach (var agendamento in agendamentosExpirados)
            {
                agendamento.StatusAgendamento = AgendamentoStatus.Rejeitado;
                agendamento.DeletionDate = DateTime.Now;

                await notificationService.CriarNotificacaoAsync(
                    agendamento.Id,
                    agendamento.Client.Id,
                    "Agendamento foi rejeitado devido a demora do pagamento!",
                    AgendamentoStatus.Rejeitado);
            }

            if (agendamentosExpirados.Any())
            {
                await _context.SaveChangesAsync(stoppingToken);
            }
        }
    }
}
