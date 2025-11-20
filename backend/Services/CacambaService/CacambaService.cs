using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

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
                    Codigo = body.Codigo,
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


        public async Task<List<Cacamba>> ListarTodos()
        {
            return await _context.Cacamba
                         .Where(c => c.DeletionDate == null)
                         .ToListAsync();
        }
        // READ BY ID
        public async Task<Cacamba?> ObterPorId(int id)
        {
            return await _context.Cacamba.Where(c => c.Id == id && c.DeletionDate == null).FirstOrDefaultAsync();
        }
        
        public async Task<bool> Deletar(int id)
        {
            var cacamba = await _context.Cacamba.Where(c => c.Id == id && c.DeletionDate == null).FirstOrDefaultAsync();
            if (cacamba == null) return false;

            cacamba.DeletionDate = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }


    }
}
