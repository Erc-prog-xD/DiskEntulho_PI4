using Backend.Dto;
using Backend.Models;

namespace Backend.Services.AuthService
{
    public interface IAuthInterface
    {
        Task<Response<ClientCriacaoDTO>> Registrar(ClientCriacaoDTO clientRegister);
        Task<Response<string>> Login(ClientLoginDTO clientLogin);

    }
}
