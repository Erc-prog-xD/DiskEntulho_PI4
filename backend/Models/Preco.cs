using Backend.Enum;

namespace Backend.Models
{
    public class Preco
    {
        public int Id { get; set; }
        public double Valor { get; set; }
        public required CacambaTamanhoEnum Tamanho{get;set;}
    }
}