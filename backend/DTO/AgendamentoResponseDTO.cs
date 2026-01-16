
using System.ComponentModel.DataAnnotations;
using Backend.Enum;
using Backend.Models;

namespace Backend.Dto
{
    public class AgendamentoResponseDTO
    {
        // Coordenadas opcionais
        public int AgendamentoId { get; set; }

        public double? Coord_X { get; set; }
        public double? Coord_Y { get; set; }
        public required Endereco Endereco { get; set; }

        [Required(ErrorMessage = "O CacambaId é obrigatório.")]
        public required CacambaDTO Cacamba { get; set; }
        public Pagamento? Pagamento { get; set; }
        public AgendamentoStatus? StatusAgendamento { get; set; }

        [Required(ErrorMessage = "A DataInicial é obrigatória.")]
        public required DateTime DataInicial { get; set; }
        
        [Required(ErrorMessage = "A DataFinal é obrigatória.")]
        public required DateTime DataFinal { get; set; }
    }
}
