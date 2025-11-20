using Backend.Data;
using Backend.Dto;
using Backend.Enum;
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

        public async Task<Response<List<Cacamba>>> CacambasDisponiveis(DateTime inicio, DateTime fim)
        {
            
            Response<List<Cacamba>> response = new Response<List<Cacamba>>();
              {
                try
                {
                    if (inicio >= fim)
                    {
                        response.Status = false;
                        response.Mensage = "A data inicial deve ser menor que a data final.";
                        return response;
                    }

                    var statusBloqueados = new[]
                    {
                        AgendamentoStatus.Criado,
                        AgendamentoStatus.Processando,
                        AgendamentoStatus.Confirmado
                    };

                    // pega apenas IDs das ocupadas
                    var cacambasOcupadas = await _context.Agendamento
                        .Where(a =>
                            a.DeletionDate == null &&
                            statusBloqueados.Contains(a.StatusAgendamento) &&
                            a.DataInicial <= fim &&
                            a.DataFinal >= inicio
                        )
                        .Select(a => a.Cacamba.Id)
                        .Distinct()
                        .ToListAsync();

                    // pega caçambas livres
                    var cacambasLivres = await _context.Cacamba
                        .Where(c =>
                            c.DeletionDate == null &&
                            c.StatusCacamba == CacambaEnum.Disponivel &&
                            !cacambasOcupadas.Contains(c.Id)
                        )
                        .ToListAsync();

                    response.Status = true;
                    response.Mensage = "Lista de caçambas disponíveis encontrada.";
                    response.Dados = cacambasLivres;
                }
                catch (Exception ex)
                {
                    response.Status = false;
                    response.Mensage = "Erro ao buscar caçambas disponíveis: " + ex.Message;
                }

                return response;
            }
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
