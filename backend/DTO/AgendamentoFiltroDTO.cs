using Backend.Enum;

namespace Backend.Dto
{
    public class AgendamentoFiltroDTO
    {
        // filtros
        public AgendamentoStatus? StatusAgendamento { get; set; }
        public PagamentoTypeEnum? TipoPagamento { get; set; }
        public PagamentoStatusEnum? StatusPagamento { get; set; }
        public int? ClientId { get; set; }
        public string? ClientCpf { get; set; }
        public int? CacambaId { get; set; }
        public string? CacambaCodigo { get; set; }

        public DateTime? DataInicialFrom { get; set; }
        public DateTime? DataInicialTo { get; set; }

        public DateTime? DataFinalFrom { get; set; }
        public DateTime? DataFinalTo { get; set; }

        public bool? HasPagamento { get; set; }      // true = só com pagamento, false = só sem pagamento
        public bool ApenasAtivos { get; set; } = true; // true = DeletionDate == null

        // paginação
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;

        // ordenação (simples)
        public string SortBy { get; set; } = "CreationDate"; // CreationDate | DataInicial | DataFinal
        public bool SortDesc { get; set; } = true;
    }
}
