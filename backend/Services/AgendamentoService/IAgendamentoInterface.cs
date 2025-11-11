using Backend.Dto;
using Backend.Models;

namespace Backend.Services.AgendamentoService
{
    public interface IAgendamentoInterface
    {
        Task<Response<Agendamento>> CadastrarAgendamento(AgendamentoDTO agendamento);

        Task<Response<Agendamento>> AdicionarPagamento(AddPagementoDTO pagamento);
    }
}
