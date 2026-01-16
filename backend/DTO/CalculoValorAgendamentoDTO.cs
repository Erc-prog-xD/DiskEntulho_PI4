using Backend.Enum;

namespace Backend.Dto
{
    public class CalculoValorAgendamentoDTO
    {
        public int AgendamentoId { get; set; }
        public int Dias { get; set; }
        public double ValorDiaria { get; set; }
        public double ValorTotal { get; set; }
        public CacambaTamanhoEnum Tamanho { get; set; }
    }
}
