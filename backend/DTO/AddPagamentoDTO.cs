using System.ComponentModel.DataAnnotations;
using Backend.Enum;

namespace Backend.Dto
{
    public class AddPagementoDTO
    {

        public required int IdAgendamento { get; set; }
        [Required(ErrorMessage = "O campo Valor é obrigatório.")]

        [EnumDataType(typeof(PagamentoTypeEnum), ErrorMessage = "Tipo de pagamento inválido.")]
        public required PagamentoTypeEnum TipoPagamento { get; set; }
    }
}