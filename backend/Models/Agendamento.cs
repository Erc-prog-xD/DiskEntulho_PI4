using Backend.Enum;
namespace Backend.Models {
  public class Agendamento {
    public int Id { get; set; }
    public double? Coord_X { get; set; }
    public double? Coord_Y { get; set; }
    public required Endereco Endereco { get; set; }
    public required Cacamba Cacamba { get; set; }
    public Pagamento? Pagamento { get; set; }
    public AgendamentoStatus StatusAgendamento { get; set; } = AgendamentoStatus.Criado;
    public DateTime CreationDate { get; set; } = DateTime.Now;
    public DateTime? DeletionDate { get; set; } = null;
    public required DateTime DataInicial { get; set; }
    public required DateTime DataFinal { get; set; }
  }
}