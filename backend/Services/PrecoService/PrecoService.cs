using Backend.Data;
using Backend.DTO;
using Backend.Enum;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.PrecoService
{
    public class PrecoService : IPrecoInterface
    {
        private readonly AppDbContext _context;

        public PrecoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Response<Preco>> CadastrarPreco(PrecoDTO precoDto)
        {
            Response<Preco> response = new Response<Preco>();

            try
            {
                // 1. VALIDAÇÃO DE ENUM:
                if (!System.Enum.IsDefined(typeof(CacambaTamanhoEnum), precoDto.Tamanho))
                {
                    response.Status = false;
                    response.Mensagem = "Tamanho inválido. Use: 0 (Pequeno), 1 (Médio) ou 2 (Grande).";
                    return response;
                }

                // Faz a conversão segura de int para Enum
                var tamanhoEnum = (CacambaTamanhoEnum)precoDto.Tamanho;

                // 2. VERIFICAÇÃO DE DUPLICIDADE
                var precoExistente = await _context.Preco
                    .FirstOrDefaultAsync(p => p.Tamanho == tamanhoEnum);

                if (precoExistente != null)
                {
                    response.Status = false;
                    response.Mensagem = $"Já existe um preço cadastrado para o tamanho {tamanhoEnum}.";
                    return response;
                }

                var novoPreco = new Preco
                {
                    Valor = precoDto.Valor,
                    Tamanho = tamanhoEnum
                };

                _context.Preco.Add(novoPreco);
                await _context.SaveChangesAsync();

                response.Status = true;
                response.Mensagem = "Preço cadastrado com sucesso!";
                response.Dados = novoPreco;
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Mensagem = "Erro ao cadastrar preço: " + ex.Message;
                response.Dados = null;
            }

            return response;
        }
    }
}