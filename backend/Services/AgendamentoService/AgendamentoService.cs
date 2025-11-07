using Backend.Data;
using Backend.Models;
using Backend.Services.SenhaService;

namespace Backend.Services.AuthService
{
    public class AgendamentoService : Agendamento
    {
        private readonly AppDbContext _context;
        public AgendamentoService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Response<Agendamento>> Cadastrar(Agendamento agendamento)
        {
            Response<Agendamento> response = new Response<Agendamento>();
            response.Mensage = "Agendamento cadastrado";
            response.Status = true;
            response.Dados = agendamento;
            return response;
        }


    }
}
