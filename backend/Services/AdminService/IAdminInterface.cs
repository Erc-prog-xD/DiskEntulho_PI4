using Backend.Dto;
using Backend.Models;

namespace Backend.Services.AdminService
{
    public interface IAdminInterface
    {
        
        Task<Response<PagedResponseDTO<AgendamentosResponseAdminsDTO>>> ListarAgendamentosEmEspecie(int page, int pageSize);
        Task<Response<string>> ConfirmarAgendamento(int idAgendamento, bool escolhaAprovacao);
        Task<Response<string>> ApagarCliente(int idCliente);
        Task<Response<string>> ReativarCliente(int idCliente);
        Task<Response<PagedResponseDTO<AgendamentosResponseAdminsDTO>>> ListarTodosAgendamentos(AgendamentoFiltroDTO filtro);
    }
}
