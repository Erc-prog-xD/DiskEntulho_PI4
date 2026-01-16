using Backend.Data;
using Backend.Dto;
using Backend.Enum;
using Backend.Models;
using Backend.Services.NotificationService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.AdminService
{
    public class AdminService : IAdminInterface
    {
        private readonly AppDbContext _context;

        private readonly INotificationService _notificationService;
        public AdminService(AppDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<Response<PagedResponseDTO<AgendamentosResponseAdminsDTO>>> ListarAgendamentosEmEspecie(int page, int pageSize)
        {
            var response = new Response<PagedResponseDTO<AgendamentosResponseAdminsDTO>>();

            try
            {
                // saneamento básico
                if (page <= 0) page = 1;
                if (pageSize <= 0) pageSize = 20;
                if (pageSize > 100) pageSize = 100;

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

                response.Status = true;
                response.Mensagem = "Agendamentos em espécie listados com sucesso.";
                response.Dados = new PagedResponseDTO<AgendamentosResponseAdminsDTO>
                {
                    Items = items,
                    Page = page,
                    PageSize = pageSize,
                    Total = total
                };
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
               var agendamento = await _context.Agendamento
                .Include(a => a.Pagamento)
                .Include(a => a.Client)
                .FirstOrDefaultAsync(a =>
                    a.Id == idAgendamento &&
                    a.DeletionDate == null &&
                    a.Pagamento != null &&
                    a.Pagamento.TipoPagamento == PagamentoTypeEnum.Especie
                );

                if (agendamento == null || agendamento.Pagamento == null){

                   response.Dados = null;
                   response.Mensagem = "Agendamento ou pagamento não encontrado";
                   response.Status = false; 
                   return response;
                }

                if (escolhaAprovacao){
                    agendamento.StatusAgendamento = AgendamentoStatus.Confirmado;
                    agendamento.Pagamento.StatusPagamento = PagamentoStatusEnum.Aprovado;
                    
                    await _notificationService.CriarNotificacaoAsync(agendamento.Id, agendamento.Client.Id, "Agendamento e pagamento confirmado", AgendamentoStatus.Confirmado);

                    response.Status = true;
                    response.Mensagem = "Agendamento e pagamento confirmado.";
                    response.Dados = null;
                }
                else
                {
                    agendamento.Pagamento.StatusPagamento = PagamentoStatusEnum.Rejeitado;
                    agendamento.StatusAgendamento = AgendamentoStatus.Rejeitado;

                    await _notificationService.CriarNotificacaoAsync(agendamento.Id, agendamento.Client.Id, "Agendamento e pagamento rejeitado", AgendamentoStatus.Rejeitado);

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

        public async Task<Response<string>> ApagarCliente(int idCliente)
        {
            Response<string> response = new Response<string>();
            try
            {
                var client = await _context.Client.FirstOrDefaultAsync(a => a.Id == idCliente && a.DeletionDate == null);
                
                if(client == null){
                    response.Status = true;
                    response.Mensagem = "Cliente não encontrado.";
                    response.Dados = null;
                    return response;
                }
                client.DeletionDate = DateTime.Now;

                await _context.SaveChangesAsync();

                response.Status = true;
                response.Mensagem = $"Cliente com cpf: '{client.Cpf}' e nome: '{client.Name}' deletado!";
                response.Dados = null;

            }
            catch (Exception ex)
            {
                response.Dados = null;
                response.Mensagem = $"Erro ao buscar os clientes: {ex.Message}";
                response.Status = false; 
            }
            return response;
        }
        
        public async Task<Response<string>> ReativarCliente(int idCliente)
        {
            Response<string> response = new Response<string>();
            try
            {
                var client = await _context.Client.FirstOrDefaultAsync(a => a.Id == idCliente && a.DeletionDate != null);
                
                if(client == null){
                    response.Status = true;
                    response.Mensagem = "Cliente não existe na base.";
                    response.Dados = null;
                    return response;
                }
                client.DeletionDate = null;

                await _context.SaveChangesAsync();

                response.Status = true;
                response.Mensagem = $"Cliente com cpf: '{client.Cpf}' e nome: '{client.Name}' reativado!";
                response.Dados = null;

            }
            catch (Exception ex)
            {
                response.Dados = null;
                response.Mensagem = $"Erro ao buscar os clientes: {ex.Message}";
                response.Status = false; 
            }
            return response;
        }

        public async Task<Response<PagedResponseDTO<AgendamentosResponseAdminsDTO>>> ListarTodosAgendamentos(AgendamentoFiltroDTO filtro)
        {
            var response = new Response<PagedResponseDTO<AgendamentosResponseAdminsDTO>>();

            try
            {
                // saneamento
                if (filtro.Page <= 0) filtro.Page = 1;
                if (filtro.PageSize <= 0) filtro.PageSize = 20;
                if (filtro.PageSize > 100) filtro.PageSize = 100;

                var query = _context.Agendamento
                    .AsNoTracking()
                    .Include(a => a.Endereco)
                    .Include(a => a.Cacamba)
                    .Include(a => a.Client)
                    .Include(a => a.Pagamento)
                    .AsQueryable();

                // filtros
                if (filtro.ApenasAtivos)
                    query = query.Where(a => a.DeletionDate == null);

                if (filtro.StatusAgendamento.HasValue)
                    query = query.Where(a => a.StatusAgendamento == filtro.StatusAgendamento.Value);

                if (filtro.ClientId.HasValue)
                    query = query.Where(a => a.Client.Id == filtro.ClientId.Value);

                if (!string.IsNullOrWhiteSpace(filtro.ClientCpf))
                    query = query.Where(a => a.Client.Cpf == filtro.ClientCpf);

                if (filtro.CacambaId.HasValue)
                    query = query.Where(a => a.Cacamba.Id == filtro.CacambaId.Value);

                if (!string.IsNullOrWhiteSpace(filtro.CacambaCodigo))
                    query = query.Where(a => a.Cacamba.Codigo == filtro.CacambaCodigo);

                if (filtro.HasPagamento.HasValue)
                {
                    if (filtro.HasPagamento.Value)
                        query = query.Where(a => a.Pagamento != null && a.Pagamento.DeletionDate == null);
                    else
                        query = query.Where(a => a.Pagamento == null);
                }

                if (filtro.TipoPagamento.HasValue)
                    query = query.Where(a => a.Pagamento != null &&
                                            a.Pagamento.DeletionDate == null &&
                                            a.Pagamento.TipoPagamento == filtro.TipoPagamento.Value);

                if (filtro.StatusPagamento.HasValue)
                    query = query.Where(a => a.Pagamento != null &&
                                            a.Pagamento.DeletionDate == null &&
                                            a.Pagamento.StatusPagamento == filtro.StatusPagamento.Value);

                if (filtro.DataInicialFrom.HasValue || filtro.DataFinalTo.HasValue)
                {
                    var start = (filtro.DataInicialFrom ?? DateTime.MinValue).Date;

                    // fim inclusivo (pega até 23:59:59 do dia)
                    var endExclusive = (filtro.DataFinalTo ?? DateTime.MaxValue).Date.AddDays(1);

                    query = query.Where(a =>
                        a.DataInicial >= start &&
                        a.DataFinal < endExclusive
                    );
                }

                // ordenação
                query = (filtro.SortBy, filtro.SortDesc) switch
                {
                    ("DataInicial", true) => query.OrderByDescending(a => a.DataInicial),
                    ("DataInicial", false) => query.OrderBy(a => a.DataInicial),

                    ("DataFinal", true) => query.OrderByDescending(a => a.DataFinal),
                    ("DataFinal", false) => query.OrderBy(a => a.DataFinal),

                    // default CreationDate
                    (_, true) => query.OrderByDescending(a => a.CreationDate),
                    (_, false) => query.OrderBy(a => a.CreationDate),
                };

                var total = await query.CountAsync();

                var items = await query
                    .Skip((filtro.Page - 1) * filtro.PageSize)
                    .Take(filtro.PageSize)
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
                        Pagamento = a.Pagamento, // pode ser null
                        StatusAgendamento = a.StatusAgendamento,
                        DataInicial = a.DataInicial,
                        DataFinal = a.DataFinal
                    })
                    .ToListAsync();

                response.Status = true;
                response.Mensagem = "Agendamentos listados com sucesso.";
                response.Dados = new PagedResponseDTO<AgendamentosResponseAdminsDTO>
                {
                    Items = items,
                    Page = filtro.Page,
                    PageSize = filtro.PageSize,
                    Total = total
                };
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Mensagem = $"Erro ao listar agendamentos: {ex.Message}";
                response.Dados = null;
            }

            return response;
        }
    }
}
