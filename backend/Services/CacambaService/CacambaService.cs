using Backend.Data;
using Backend.Dto;
using Backend.Models;

namespace Backend.Services.CacambaService
{
    public class CacambaService : Cacamba
    {
        private readonly AppDbContext _context;
        public CacambaService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Response<Cacamba>> Cadastrar(CacambaDTO body)
        {
         Response<Cacamba> response = new Response<Cacamba>();

        try
        {
            Cacamba cacamba = new Cacamba
            {
                Tamanho = body.Tamanho
            };

            _context.Cacamba.Add(cacamba); 
            await _context.SaveChangesAsync();

            response.Mensage = "Caçamba cadastrada com sucesso";
            response.Status = true;
            response.Dados = cacamba;
            }
            catch (Exception ex)
            {
                response.Mensage = "Falha no cadastro da caçamba: " + ex.Message;
                response.Status = false;
                response.Dados = null;
            }

            return response;
        }


    }
}
