using Backend.Data;
using Backend.Dto;
using Backend.Enum;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.CacambaService
{
    public class CacambaService : ICacambaInterface
    {
        private readonly AppDbContext _context;
        public CacambaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Response<List<Cacamba>>> CacambasDisponiveis(DateTime inicio, DateTime fim)
        {
            
            Response<List<Cacamba>> response = new Response<List<Cacamba>>();
                try
                {
                    if (inicio >= fim)
                    {
                        response.Status = false;
                        response.Mensagem = "A data inicial deve ser menor que a data final.";
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
                    response.Mensagem = "Lista de caçambas disponíveis encontrada.";
                    response.Dados = cacambasLivres;
                }
                catch (Exception ex)
                {
                    response.Status = false;
                    response.Mensagem = "Erro ao buscar caçambas disponíveis: " + ex.Message;
                }

                return response;
            
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

                response.Mensagem = "Caçamba cadastrada com sucesso";
                response.Status = true;
                response.Dados = cacamba;
            }
            catch (Exception ex)
            {
                response.Mensagem = "Falha no cadastro da caçamba: " + ex.Message;
                response.Status = false;
                response.Dados = null;
            }

            return response;
        }


       public async Task<Response<List<Cacamba>>> ListarTodos()
        {
            Response<List<Cacamba>> response = new Response<List<Cacamba>>();

            try
            {
                var listagem = await _context.Cacamba
                    .Where(c => c.DeletionDate == null)
                    .ToListAsync();

                response.Status = true;
                response.Mensagem = "Lista de caçambas.";
                response.Dados = listagem;
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Mensagem = "Erro ao listar caçambas: " + ex.Message;
                response.Dados = null;
            }

            return response;
        }


        public async Task<Response<Cacamba>> ObterPorId(int id)
        {
            Response<Cacamba> response = new Response<Cacamba>();

            try
            {
                var cacamba = await _context.Cacamba
                    .FirstOrDefaultAsync(c => c.Id == id && c.DeletionDate == null);

                if (cacamba == null)
                {
                    response.Status = false;
                    response.Mensagem = "Caçamba não encontrada.";
                    response.Dados = null;
                    return response;
                }

                response.Status = true;
                response.Mensagem = "Caçamba encontrada.";
                response.Dados = cacamba;
                return response;
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Mensagem = "Erro ao buscar caçamba: " + ex.Message;
                response.Dados = null;
                return response;
            }
        }
        
        public async Task<Response<string>> Deletar(int id)
        {   
            Response<string> response = new Response<string>();
            try
            {
                
            var cacamba = await _context.Cacamba.Where(c => c.Id == id && c.DeletionDate == null).FirstOrDefaultAsync();
            if (cacamba == null)
            {
                response.Dados = null;
                response.Status = false;
                response.Mensagem = "Caçamba não existe na base de dados";
                return response;
            }

            cacamba.DeletionDate = DateTime.Now;
            await _context.SaveChangesAsync();

            response.Dados = null;
            response.Status = true;
            response.Mensagem = "Caçamba deletada!";
            }
            catch (Exception ex)
            {
                response.Mensagem = "Falha ao deletar:" + ex.Message;
                response.Status = false;
                response.Dados = null;
            }

            return response;
        }

       public async Task<Response<Cacamba>> Atualizar(int id, CacambaUpdateDTO dto)
        {
            Response<Cacamba> response = new Response<Cacamba>();

            try
            {
                var cacamba = await _context.Cacamba
                    .FirstOrDefaultAsync(c => c.Id == id && c.DeletionDate == null);

                if (cacamba == null)
                {
                    response.Status = false;
                    response.Mensagem = "Caçamba não encontrada.";
                    response.Dados = null;
                    return response;
                }

                if (!string.IsNullOrWhiteSpace(dto.Codigo))
                    cacamba.Codigo = dto.Codigo;

                if (dto.Tamanho.HasValue)
                    cacamba.Tamanho = dto.Tamanho.Value;

                if (dto.StatusCacamba.HasValue)
                    cacamba.StatusCacamba = dto.StatusCacamba.Value;

                _context.Cacamba.Update(cacamba);
                await _context.SaveChangesAsync();

                response.Status = true;
                response.Mensagem = "Caçamba atualizada com sucesso.";
                response.Dados = cacamba;
                return response;
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Mensagem = "Erro ao atualizar caçamba: " + ex.Message;
                response.Dados = null;
                return response;
            }
        }


    }
}
