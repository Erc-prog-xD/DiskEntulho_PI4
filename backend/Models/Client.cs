
namespace Backend.Models
{
    public class Client
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Cpf { get; set; }
        public required string Email {get;set;}
        public required string Phone { get; set; }
        public required byte[] PasswordHash { get; set; }
        public required byte[] PasswordSalt { get; set; }
        public bool IsAdmin { get; set; } = false;
        public DateTime CreationDate { get; set; } = DateTime.Now;
        public DateTime? DeletionDate { get; set; } = null;

    }
}