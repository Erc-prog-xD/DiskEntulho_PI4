using Backend.Dto;
using Backend.Models;

namespace Backend.Services.PagamentoService
{
    public interface IPagamentoInterface
    {
        Task<Response<Agendamento>> AdicionarPagamento(AddPagementoDTO pagamento);

        Task<Response<Agendamento>> AprovarPagamentoEspecie(int agendamentoId);
    }
}
