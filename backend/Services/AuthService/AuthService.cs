using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Backend.Services.SenhaService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.AuthService
{
    public class AuthService : IAuthInterface
    {
        private readonly AppDbContext _context;
        private readonly ISenhaInterface _senhaInterface;
        public AuthService(AppDbContext context, ISenhaInterface senhaInterface)
        {
            _context = context;
            _senhaInterface = senhaInterface;
        }
        

        public async Task<Response<ClientCriacaoDTO>> Registrar(ClientCriacaoDTO clientRegister)
        {
            Response<ClientCriacaoDTO> response = new Response<ClientCriacaoDTO>();
            try
            {
                if (!VerificaCpfJaExiste(clientRegister))
                {
                    response.Dados = null;
                    response.Status = false;
                    response.Mensage = "Cpf ja cadastrado!";
                    return response;
                }

                _senhaInterface.CriarSenhaHash(clientRegister.Password, out byte[] senhaHash, out byte[] senhaSalt);
                Client client = new Client
                {
                    Name = clientRegister.Name,
                    Email = clientRegister.Email,
                    Cpf = clientRegister.Cpf,
                    Phone = clientRegister.Phone,
                    PasswordHash = senhaHash,
                    PasswordSalt = senhaSalt
                };
                _context.Add(client);
                await _context.SaveChangesAsync();

                response.Mensage = "Client Cadastrado!";
               
            }
            catch (Exception ex)
            {
                response.Dados = null;
                response.Status = false;
                response.Mensage = ex.Message;
            }
            return response;

        }

        public async Task<Response<string>> Login(ClientLoginDTO clientLogin)
        {
            Response<string> response = new Response<string> { Mensage = "" };

            try
                {
                    var client = await _context.Client.FirstOrDefaultAsync(Client => Client.Cpf == clientLogin.Cpf && Client.DeletionDate == null);
                    if (client == null)
                    {
                        response.Status = false;
                        response.Mensage = "Client não encontrado!";
                        return response;
                    }
                    if (!_senhaInterface.VerificaSenhaHash(clientLogin.Password, client.PasswordHash, client.PasswordSalt))
                    {
                        response.Status = false;
                        response.Mensage = "Credenciais invalidas!";
                        return response;
                    }

                    var token = _senhaInterface.CriarToken(client);
                    response.Mensage = "Login realizado com sucesso!";
                    response.Dados = token;
                    response.Status = true;

                }
            catch(Exception ex)
                {
                    response.Dados = null;
                    response.Status = false;
                    response.Mensage = ex.Message;
                }

            return response;
        }


          public bool VerificaCpfJaExiste(ClientCriacaoDTO clientRegister)
        {
            var client = _context.Client.FirstOrDefault(Client => Client.Cpf == clientRegister.Cpf);
            return client == null ? true : false;
        }
    }
}
