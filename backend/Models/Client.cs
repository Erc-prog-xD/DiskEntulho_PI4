namespace Backend.Models
{
    public class Client
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Cpf { get; set; }
        public required string Phone { get; set; }
        public required byte[] PasswordHash { get; set; }
        public required byte[] PasswordSalt { get; set; }
        public bool isAdmin { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}