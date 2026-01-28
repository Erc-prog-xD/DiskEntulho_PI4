using Backend.Data;
using Backend.Enum;
using Backend.Models;
using Backend.Services.SenhaService;
using Microsoft.EntityFrameworkCore;

public static class DbInitializer
{
    public static async Task InitializeAsync(
        AppDbContext context,
        ISenhaInterface senhaService)
    {
        // 🔹 Admin
        if (!await context.Client.AnyAsync(u => u.IsAdmin))
        {
            senhaService.CriarSenhaHash("admin", out byte[] hash, out byte[] salt);

            var admin = new Client
            {
                Name = "admin",
                Cpf = "54838493029",
                Email = "admin@admin.com",
                Phone = "(00)0000-0000",
                IsAdmin = true,
                PasswordHash = hash,
                PasswordSalt = salt
            };

            context.Client.Add(admin);
        }

        // 🔹 Preços
        if (!await context.Preco.AnyAsync())
        {
            var precos = new List<Preco>
            {
                new() { Tamanho = CacambaTamanhoEnum.Pequeno, Valor = 2 },
                new() { Tamanho = CacambaTamanhoEnum.Medio, Valor = 4 },
                new() { Tamanho = CacambaTamanhoEnum.Grande, Valor = 6 },
            };

            context.Preco.AddRange(precos);
        }

        await context.SaveChangesAsync();
        Console.WriteLine("✔ Seed executado com sucesso");
    }
}

