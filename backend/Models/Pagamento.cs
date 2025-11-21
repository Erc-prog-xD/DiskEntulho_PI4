using Backend.Enum;

namespace Backend.Models
{
    public class Pagamento
    {
        public int Id { get; set; }
        public required double Valor { get; set; }
        public required PagamentoTypeEnum TipoPagemento { get; set; }
        public PagamentoStatusEnum StatusPagemento { get; set; } = PagamentoStatusEnum.Criado;
        public DateTime CreationDate { get; set; } = DateTime.Now;
        public DateTime? DeletionDate { get; set; } = null;
        public string? PagBankOrderId { get; set; }
        public string? PagBankQrCode { get; set; }
    }
}