using Backend.Data;
using Backend.Enum;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext context)
    {
        // se já tiver dados, não insere de novo
        if (await context.Preco.AnyAsync())
            return;
        
        var precos = new List<Preco>
        {
            new() { Tamanho = CacambaTamanhoEnum.Pequeno, Valor = 2 },
            new() { Tamanho = CacambaTamanhoEnum.Medio, Valor = 4 },
            new() { Tamanho = CacambaTamanhoEnum.Grande, Valor = 6 },
        };

        context.Preco.AddRange(precos);
        await context.SaveChangesAsync();

        Console.WriteLine("✔ Seed de preços executado");
    }
}
