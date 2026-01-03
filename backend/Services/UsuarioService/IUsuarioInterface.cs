using Backend.Dto;
using Backend.Models;

namespace Backend.Services.UsuarioService
{
    public interface IUsuarioInterface
    {
        Task<Response<UsuarioResponseDTO>> ObterMe(int usuarioId);
        Task<Response<UsuarioResponseDTO>> AtualizarMe(int usuarioId, UsuarioUpdateDTO dto);
    }
}
