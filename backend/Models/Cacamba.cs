using Backend.Enum;
namespace Backend.Models
{
    public class Cacamba
    {
        public int Id { get; set; }
        public CacambaEnum StatusCacamba { get; set; } = CacambaEnum.disponivel;
        public DateTime CreationDate { get; set; } = DateTime.Now;
        public DateTime? DeletionDate { get; set; } = null;
    }
}