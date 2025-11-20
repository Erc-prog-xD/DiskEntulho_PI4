using Backend.Dto;
using Backend.Models;

namespace Backend.Services.AgendamentoService
{
    public interface IAgendamentoInterface
    {
        Task<Response<Agendamento>> CadastrarAgendamento(AgendamentoCreateDTO agendamento);

        Task<Response<List<AgendamentoResponseDTO>>> BuscarAgendamentosFeitos();
    }
}
