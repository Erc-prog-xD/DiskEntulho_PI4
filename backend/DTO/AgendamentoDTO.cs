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

        // IDs das entidades relacionadas
        [Required(ErrorMessage = "O CacambaId é obrigatório.")]
        public required int CacambaId { get; set; }

        // Status do agendamento (enum)
        public AgendamentoStatus StatusAgendamento { get; set; } = AgendamentoStatus.Criado;

        // Datas obrigatórias
        [Required(ErrorMessage = "A DataInicial é obrigatória.")]
        public required DateTime DataInicial { get; set; }

        [Required(ErrorMessage = "A DataFinal é obrigatória.")]
        public required DateTime DataFinal { get; set; }

        // Somente leitura — não precisa preencher na criação
        public DateTime CreationDate { get; set; } = DateTime.Now;
        public DateTime? DeletionDate { get; set; } = null;
    }
}
