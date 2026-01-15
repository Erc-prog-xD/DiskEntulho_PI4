using System.ComponentModel.DataAnnotations;
using Backend.Enum;

namespace Backend.Dto
{
    public class CacambaUpdateDTO
    {
        public string? Codigo { get; set; }

        [EnumDataType(typeof(CacambaTamanhoEnum), ErrorMessage = "Tamanho inválido.")]
        public CacambaTamanhoEnum? Tamanho { get; set; }

        [EnumDataType(typeof(CacambaEnum), ErrorMessage = "Status da caçamba inválido.")]
        public CacambaEnum? StatusCacamba { get; set; }
    }
}
