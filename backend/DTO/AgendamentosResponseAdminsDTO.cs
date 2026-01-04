
using System.ComponentModel.DataAnnotations;
using Backend.Enum;
using Backend.Models;

namespace Backend.Dto
{
    public class AgendamentosResponseAdminsDTO
    {
        public int AgendamentoId {get; set;}
        public required Endereco Endereco { get; set; }
        public required CacambaDTO Cacamba { get; set; }
        public required int ClientId {get; set;}
        public required string ClientCpf {get; set;}
        public required string ClientName { get; set; }
        public required Pagamento Pagamento { get; set; }
        public AgendamentoStatus? StatusAgendamento { get; set; }
        public required DateTime DataInicial { get; set; }
        public required DateTime DataFinal { get; set; }
        
        // paginação
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;

    }
}
