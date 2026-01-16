using Backend.Dto;
using Backend.Models;

namespace Backend.Services.PagamentoService
{
    public interface IPagamentoInterface
    {
        Task<Response<Agendamento>> AdicionarPagamento(AddPagementoDTO pagamento);

        Task<Response<CalculoValorAgendamentoDTO>> CalcularValorAgendamento(int idAgendamento);
        Task<Response<Pagamento?>> ObterPagamentoPorId(int idPagamento);

    }
}
