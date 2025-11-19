using System.ComponentModel.DataAnnotations;
using Backend.Enum;

namespace Backend.Dto
{
    public class CacambaDTO
    {
        [Required(ErrorMessage = "O campo Código é obrigatório.")]
        public required string Codigo { get; set; }
        [Required(ErrorMessage = "O campo Tamanho é obrigatório.")]
        [EnumDataType(typeof(CacambaTamanhoEnum), ErrorMessage = "Tamanho inválido.")]
        public required CacambaTamanhoEnum Tamanho { get; set; }
    }
}
