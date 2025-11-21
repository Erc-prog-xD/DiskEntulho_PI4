using Backend.Data;
using Backend.Enum;
using Backend.Models;

namespace Backend.Services.NotificationService
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task CriarNotificacaoAsync(int agendamentoId, int clientId, string mensagem, AgendamentoStatus statusAgendamento)
        {
            var notificacao = new AgendamentoNotification
            {
                AgendamentoId = agendamentoId,
                ClientId = clientId,
                Mensagem = mensagem,
                StatusAgendamento = statusAgendamento
            };

            await _context.AgendamentoNotification.AddAsync(notificacao);
            await _context.SaveChangesAsync();
        }
    }
}
