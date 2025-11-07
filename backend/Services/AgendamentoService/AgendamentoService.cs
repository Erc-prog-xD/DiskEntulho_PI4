using Backend.Data;
using Backend.Dto;
using Backend.Models;

namespace Backend.Services.AgendamentoService
{
    public class AgendamentoService : Agendamento
    {
        private readonly AppDbContext _context;
        public AgendamentoService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Response<AgendamentoDTO>> Cadastrar(AgendamentoDTO agendamento)
        {
            Response<AgendamentoDTO> response = new Response<AgendamentoDTO>();
            response.Mensage = "Agendamento cadastrado";
            response.Status = true;
            response.Dados = agendamento;
            return response;
        }


    }
}
