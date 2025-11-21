using Backend.Enum;

namespace Backend.Models
{
    public class AgendamentoNotification
    {
        public int Id { get; set; }
        public required int AgendamentoId { get; set; }
        public required int ClientId {get;set;}
        public required string Mensagem { get; set; }
        public required AgendamentoStatus StatusAgendamento { get; set; }
        public bool Enviado { get; set; } = false;
        public DateTime CriadoEm { get; set; } = DateTime.Now;
        public DateTime? EnviadoEm { get; set; }
    }
}
