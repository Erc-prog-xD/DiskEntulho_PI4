using Backend.Enum;
namespace Backend.Models
{
    public class Cacamba
    {
        public int Id { get; set; }
        public required string Codigo { get; set; }
        public required CacambaTamanhoEnum Tamanho { get; set; }
        public CacambaEnum StatusCacamba { get; set; } = CacambaEnum.Disponivel;
        public DateTime CreationDate { get; set; } = DateTime.Now;
        public DateTime? DeletionDate { get; set; } = null;
    }
}