using Backend.Dto;
using Backend.Models;

namespace Backend.Services.AdminService
{
    public interface IAdminInterface
    {
        
        Task<Response<List<AgendamentosResponseAdminsDTO>>> ListarAgendamentosEmEspecie(int page, int pageSize);

    }
}
