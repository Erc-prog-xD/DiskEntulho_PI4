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
        public async Task<Response<Cacamba>> Cadastrar()
        {
            Response<Cacamba> response = new Response<Cacamba>();
            Cacamba cacamba = new Cacamba();

            try
            {
                response.Mensage = "Caçamba cadastrada";
                response.Status = true;
                response.Dados = cacamba;
                _context.Add(cacamba);
                await _context.SaveChangesAsync();
            }
            catch 
            {
                response.Mensage = "Falha no cadastrado da caçamba";
                response.Status = false;
                response.Dados = null;
            }
            return response;
        }


    }
}
