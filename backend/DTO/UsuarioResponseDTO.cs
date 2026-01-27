namespace Backend.Dto
{
    public class UsuarioResponseDTO
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Cpf { get; set; }
        public required string Email { get; set; }
        public required string Phone { get; set; }
        public bool IsAdmin { get; set; }
    }
}
