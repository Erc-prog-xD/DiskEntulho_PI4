using System.ComponentModel.DataAnnotations;

namespace Backend.Dto
{
    public class ClientCriacaoDTO
    {
        [Required(ErrorMessage = "O campo Nome é obrigatório.")]
        public required string Name { get; set; }

        [Required(ErrorMessage = "O campo Cpf é obrigatório.")]
        public required string Cpf { get; set; }

        [Required(ErrorMessage = "O campo Phone é obrigatório.")]
        public required string Phone {get; set;}
        
        [Required(ErrorMessage = "O campo Password é obrigatório.")]
        public required string Password { get; set; }
    }
}
