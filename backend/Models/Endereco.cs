namespace Backend.Models
{
    public class Endereco
    {
        public required string Rua { get; set; }
        public required string Bairro { get; set; } 
        public required string Cidade { get; set; } 
        public required string Estado { get; set; } 
        public string? DescricaoLocal { get; set; } 
        public string? Referencia { get; set; }
    }
}