using Backend.Dto;
using Backend.Models;

namespace Backend.Services.CacambaService
{
    public interface ICacambaInterface
    {
        Task<Response<List<Cacamba>>> CacambasDisponiveis(DateTime inicio, DateTime fim);
        Task<Response<Cacamba>> Cadastrar(CacambaDTO body);
        Task<Response<List<Cacamba>>> ListarTodos();
        Task<Response<Cacamba>> ObterPorId(int id);
        Task<Response<string>> Deletar(int id);
        Task<Response<Cacamba>> Atualizar(int id, CacambaUpdateDTO dto);
    }
}
