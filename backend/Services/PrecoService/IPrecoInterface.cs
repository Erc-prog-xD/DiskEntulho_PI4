using Backend.DTO;
using Backend.Models;

namespace Backend.Services.PrecoService
{
    public interface IPrecoInterface
    {
        // Método para cadastrar preço
        Task<Response<Preco>> CadastrarPreco(PrecoDTO precoDto);
    }
}