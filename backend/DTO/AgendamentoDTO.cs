using System;
using System.ComponentModel.DataAnnotations;
using Backend.Enum;
using Backend.Models;

namespace Backend.Dto
{
    public class AgendamentoDTO
    {
        // Coordenadas opcionais
        public double? Coord_X { get; set; }
        public double? Coord_Y { get; set; }
        public required Endereco Endereco { get; set; }

        [Required(ErrorMessage = "O CacambaId é obrigatório.")]
        public required int CacambaId { get; set; }

        [Required(ErrorMessage = "A DataInicial é obrigatória.")]
        public required DateTime DataInicial { get; set; }
        
        [Required(ErrorMessage = "A DataFinal é obrigatória.")]
        public required DateTime DataFinal { get; set; }
    }
}
