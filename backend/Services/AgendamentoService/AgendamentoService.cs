using System.Security.Claims;
using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.AgendamentoService
{
    public class AgendamentoService : IAgendamentoInterface
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AgendamentoService(AppDbContext context,  IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<Response<Agendamento>> CadastrarAgendamento(AgendamentoDTO agendamento)
        {
            Response<Agendamento> response = new Response<Agendamento>();
            try
            {

                // 🔹 Verificação de datas
                if (agendamento.DataInicial < DateTime.Now || agendamento.DataFinal < DateTime.Now)
                {
                    response.Status = false;
                    response.Mensage = "As datas devem ser futuras.";
                    return response;
                }

                if (agendamento.DataInicial < agendamento.DataFinal)
                {
                    response.Status = false;
                    response.Mensage = "A data inicial não pode ser menor que a data final.";
                    return response;
                }
                // Verifica se a caçamba existe
                var cacamba = await _context.Cacamba.FindAsync(agendamento.CacambaId);
                if (cacamba == null)
                {
                    response.Status = false;
                    response.Mensage = $"Caçamba com ID {agendamento.CacambaId} não encontrada.";
                    response.Dados = null;
                    return response;
                }

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
                if (client == null)
                {
                    response.Status = false;
                    response.Mensage = "Cliente não encontrado.";
                    return response;
                }

                // Cria uma nova instância da entidade Agendamento com base no DTO
                var novoAgendamento = new Agendamento
                {
                    Coord_X = agendamento.Coord_X,
                    Coord_Y = agendamento.Coord_Y,
                    Endereco = agendamento.Endereco,
                    Client = client,
                    Cacamba = cacamba,
                    DataInicial = agendamento.DataInicial,
                    DataFinal = agendamento.DataFinal
                };

                // Adiciona no contexto e salva
                _context.Agendamento.Add(novoAgendamento);
                await _context.SaveChangesAsync();

                response.Status = true;
                response.Mensage = "Agendamento cadastrado com sucesso!";
                response.Dados = novoAgendamento;
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Mensage = $"Erro ao cadastrar agendamento: {ex.Message}";
                response.Dados = null;
            }

            return response;
        }

        public async Task<Response<Agendamento>> AdicionarPagamento(AddPagementoDTO pagamento)
        {
            Response<Agendamento> response = new Response<Agendamento>();
            try
            {
                var agendamento = await _context.Agendamento
                    .Include(a => a.Pagamento)
                    .FirstOrDefaultAsync(a => a.Id == pagamento.idAgendamento && a.DeletionDate == null);

                if (agendamento == null)
                {
                    response.Mensage = "Agendamento não encontrado";
                    response.Status = false;
                    response.Dados = null;
                    return response;
                }

                Pagamento novoPagamento = new Pagamento
                {
                    Valor = pagamento.Valor,
                    TipoPagemento = pagamento.TipoPagemento
                };

                agendamento.Pagamento = novoPagamento;
                _context.Add(novoPagamento);
                _context.Update(agendamento);
                await _context.SaveChangesAsync();

                response.Mensage = "Pagamento adicionado ao agendamento";
                response.Status = true;
                response.Dados = agendamento;
            }
            catch
            {
                response.Mensage = "Erro ao adicionar pagamento";
                response.Status = false;
                response.Dados = null;
                return response;
            }
        return response;
        }
        
    }
}
