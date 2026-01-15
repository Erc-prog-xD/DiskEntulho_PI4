using Backend.Dto;
using Backend.Models;

namespace Backend.Services.AgendamentoService
{
    public interface IAgendamentoInterface
    {
        Task<Response<Agendamento>> CadastrarAgendamento(int clientId, AgendamentoCreateDTO agendamento);

        Task<Response<List<AgendamentoResponseDTO>>> BuscarAgendamentosFeitosUsuarioLogado(int clientId);
    }
}
