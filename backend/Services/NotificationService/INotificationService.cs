using Backend.Enum;

namespace Backend.Services.NotificationService
{
    public interface INotificationService
    {
        Task CriarNotificacaoAsync(int agendamentoId, int clientId, string mensagem, AgendamentoStatus statusAgendamento);
    }
}
