using System.ComponentModel.DataAnnotations;
using Backend.Enum;

namespace Backend.Dto
{
    public class AddPagementoDTO
    {   

        public required int idAgendamento { get; set; } 
        [Required(ErrorMessage = "O campo Valor é obrigatório.")]
        public required double Valor { get; set; }

        [Required(ErrorMessage = "O campo TipoPagamento é obrigatório.")]
        [EnumDataType(typeof(PagamentoTypeEnum), ErrorMessage = "Tipo de pagamento inválido.")]
        public required PagamentoTypeEnum TipoPagemento { get; set; }
    }
}