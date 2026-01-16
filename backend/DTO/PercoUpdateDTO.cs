using System.ComponentModel.DataAnnotations;
using Backend.Enum;

namespace Backend.Dto
{
    public class PrecoUpdateDTO
    {
        [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser maior que zero.")]
        public double? Valor { get; set; }

        [EnumDataType(typeof(CacambaTamanhoEnum), ErrorMessage = "Tamanho inválido.")]
        public CacambaTamanhoEnum? Tamanho { get; set; }
    }
}
