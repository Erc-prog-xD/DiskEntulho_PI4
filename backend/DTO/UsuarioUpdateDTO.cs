using System.ComponentModel.DataAnnotations;

namespace Backend.Dto
{
    public class UsuarioUpdateDTO
    {
        public string? Name { get; set; }

        [EmailAddress(ErrorMessage = "Email inválido.")]
        public string? Email { get; set; }

        public string? Phone { get; set; }

        [MinLength(6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres.")]
        public string? NewPassword { get; set; }
    }
}
