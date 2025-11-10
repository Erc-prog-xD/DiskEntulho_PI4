using System.ComponentModel.DataAnnotations;
using Backend.Enum;

namespace Backend.Dto
{
    public class CacambaDTO
    {
        [Required(ErrorMessage = "O campo Tamanho é obrigatório.")]
        public required CacambaTamanhoEnum Tamanho { get; set; }
    }
}
