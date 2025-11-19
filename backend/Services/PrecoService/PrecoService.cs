using System.Security.Claims;
using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using backend.DTO;
using backend.Models;

namespace backend.Services.PrecoService
{
    public class PrecoService : Preco
    {

        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public PrecoService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<Response<Preco>> CadastrarPrecoCacamba(PrecoDTO preco)
        {

            Response<Preco> response = new Response<Preco>();

            try
            {
                var clientIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (clientIdClaim == null)
                {
                    response.Status = false;
                    response.Mensage = "Usuário não autenticado.";
                    return response;
                }

                int clientId = int.Parse(clientIdClaim);

                // 🔹 Busca o cliente no banco
                var client = await _context.Client.FindAsync(clientId);
                if (client == null || client.isAdmin == false)
                {
                    response.Status = false;
                    response.Mensage = "Cliente não encontrado ou não é admin.";
                    return response;
                }

                var cacamba = await _context.Cacamba
                    .FirstOrDefaultAsync(c => c.Codigo == preco.CodigoCacamba);
                if (cacamba == null)
                {
                    response.Status = false;
                    response.Mensage = "Caçamba não encontrada.";
                    return response;
                }
                Preco novoPreco = new Preco
                {
                    Valor = preco.Valor,
                    codigoCacamba = cacamba
                };
                _context.Preco.Add(novoPreco);
                await _context.SaveChangesAsync();
                response.Mensage = "Preço cadastrado com sucesso";
                response.Status = true;
                response.Dados = novoPreco;

            }
            catch (Exception ex)
            {
                response.Dados = null;
                response.Status = false;
                response.Mensage = ex.Message;
            }
            return response;

        }
    }
}