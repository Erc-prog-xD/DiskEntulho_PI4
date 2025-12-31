using Backend.Data;
using Backend.Dto;
using Backend.Enum;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.AdminService
{
    public class AdminService : IAdminInterface
    {
        private readonly AppDbContext _context;
        public AdminService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Response<List<AgendamentosResponseAdminsDTO>>> ListarAgendamentosEmEspecie(int page, int pageSize)
        {
            Response<List<AgendamentosResponseAdminsDTO>> response = new Response<List<AgendamentosResponseAdminsDTO>>();
            try
            {
                // saneamento básico
                if (page <= 0) page = 1;
                if (pageSize <= 0) pageSize = 20;
                if (pageSize > 100) pageSize = 100; // limita pra evitar abuso

                var query = _context.Agendamento
                    .AsNoTracking()
                    .Where(a =>
                        a.DeletionDate == null &&
                        a.Pagamento != null &&
                        a.Pagamento.DeletionDate == null &&
                        a.Pagamento.TipoPagamento == PagamentoTypeEnum.Especie &&
                        a.Pagamento.StatusPagamento == PagamentoStatusEnum.Processando
                    )
                    .Include(a => a.Endereco)
                    .Include(a => a.Cacamba)
                    .Include(a => a.Client)
                    .Include(a => a.Pagamento)
                    .OrderByDescending(a => a.CreationDate);

                    var total = await query.CountAsync();
                    var items = await query

                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(a => new AgendamentosResponseAdminsDTO
                    {
                        AgendamentoId = a.Id,
                        Endereco = a.Endereco,
                        Cacamba = new CacambaDTO
                        {
                            Codigo = a.Cacamba.Codigo,
                            Tamanho = a.Cacamba.Tamanho
                        },
                        ClientId = a.Client.Id,
                        ClientCpf = a.Client.Cpf,
                        ClientName = a.Client.Name,
                        Pagamento = a.Pagamento!, 
                        StatusAgendamento = a.StatusAgendamento,
                        DataInicial = a.DataInicial,
                        DataFinal = a.DataFinal
                    })
                    .ToListAsync();
                response.Dados = items;
                response.Mensagem = "Agendamentos em espécie listados com sucesso.";
                response.Status = true;
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Mensagem = $"Erro ao buscar os agendamentos: {ex.Message}";
                response.Dados = null;
            }
            return response;
        }
        
        public async Task<Response<string>> ConfirmarAgendamento (int idAgendamento, bool escolhaAprovacao)
        {
            Response<string> response = new Response<string>();
            try
            {
                var agendamento = await _context.Agendamento.Include(a => a.Pagamento).FirstOrDefaultAsync(a => a.Id == idAgendamento && a.DeletionDate == null);

                if (agendamento == null || agendamento.Pagamento == null){

                   response.Dados = null;
                   response.Mensagem = "Agendamento ou pagamento não encontrado";
                   response.Status = false; 
                   return response;
                }

                if (escolhaAprovacao){
                    agendamento.StatusAgendamento = AgendamentoStatus.Confirmado;
                    agendamento.Pagamento.StatusPagamento = PagamentoStatusEnum.Aprovado;
                    
                    response.Status = true;
                    response.Mensagem = "Agendamento e pagamento confirmado.";
                    response.Dados = null;
                }
                else
                {
                    agendamento.Pagamento.StatusPagamento = PagamentoStatusEnum.Rejeitado;
                    agendamento.StatusAgendamento = AgendamentoStatus.Rejeitado;

                    response.Status = true;
                    response.Mensagem = "Agendamento e pagamento rejeitado.";
                    response.Dados = null;
                }

                await _context.SaveChangesAsync();

            }
            catch(Exception ex)
            {
                response.Dados = null;
                response.Mensagem = $"Erro ao buscar os agendamentos: {ex.Message}";
                response.Status = false; 
            }

            
            return response;

        }
    
    }
}
