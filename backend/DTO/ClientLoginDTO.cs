using System.ComponentModel.DataAnnotations;

namespace Backend.Dto
{
    public class ClientLoginDTO
    {
        [Required(ErrorMessage = "O campo Email é obrigatório.")]
        public required string Cpf { get; set; }
        
        [Required(ErrorMessage = "O campo Password é obrigatório.")]
        public required string Password { get; set; }
    }
}
