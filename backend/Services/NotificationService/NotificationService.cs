using Backend.Data;
using Backend.Enum;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

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
            bool existe = await _context.AgendamentoNotification
            .AnyAsync(n => n.AgendamentoId == agendamentoId && n.StatusAgendamento == statusAgendamento);

            if (existe)
                return; // já existe, não envia de novo

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
