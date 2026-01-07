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
                // CORREÇÃO AQUI: Convertendo o int do DTO para o Enum do Banco
                var tamanhoEnum = (CacambaTamanhoEnum)precoDto.Tamanho;

                // 1. Verifica se já existe um preço para esse tamanho
                var precoExistente = await _context.Preco
                    .FirstOrDefaultAsync(p => p.Tamanho == tamanhoEnum); // Agora compara Enum com Enum!

                if (precoExistente != null)
                {
                    response.Status = false;
                    response.Mensagem = $"Já existe um preço cadastrado para o tamanho {precoDto.Tamanho}.";
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