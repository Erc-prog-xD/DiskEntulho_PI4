using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Backend.Services.SenhaService;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.UsuarioService
{
    public class UsuarioService : IUsuarioInterface
    {
        private readonly AppDbContext _context;
        private readonly ISenhaInterface _senhaInterface;

        public UsuarioService(AppDbContext context, ISenhaInterface senhaInterface)
        {
            _context = context;
            _senhaInterface = senhaInterface;
        }

        private static UsuarioResponseDTO ToDto(Client client)
        {
            return new UsuarioResponseDTO
            {
                Id = client.Id,
                Name = client.Name,
                Cpf = client.Cpf,
                Email = client.Email,
                Phone = client.Phone,
                isAdmin = client.isAdmin
            };
        }

        public async Task<Response<UsuarioResponseDTO>> ObterMe(int usuarioId)
        {
            Response<UsuarioResponseDTO> response = new Response<UsuarioResponseDTO>();

            Client? client = await _context.Client
                .FirstOrDefaultAsync(c => c.Id == usuarioId && c.DeletionDate == null);

            if (client == null)
            {
                response.Status = false;
                response.Mensagem = "Usuário não encontrado.";
                return response;
            }

            response.Status = true;
            response.Mensagem = "Perfil do usuário.";
            response.Dados = ToDto(client);
            return response;
        }

        public async Task<Response<UsuarioResponseDTO>> AtualizarMe(int usuarioId, UsuarioUpdateDTO dto)
        {
            Response<UsuarioResponseDTO> response = new Response<UsuarioResponseDTO>();

            Client? client = await _context.Client
                .FirstOrDefaultAsync(c => c.Id == usuarioId && c.DeletionDate == null);

            if (client == null)
            {
                response.Status = false;
                response.Mensagem = "Usuário não encontrado.";
                return response;
            }

            if (!string.IsNullOrWhiteSpace(dto.Name))
                client.Name = dto.Name;

            if (!string.IsNullOrWhiteSpace(dto.Email))
                client.Email = dto.Email;

            if (!string.IsNullOrWhiteSpace(dto.Phone))
                client.Phone = dto.Phone;

            if (!string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                _senhaInterface.CriarSenhaHash(dto.NewPassword, out byte[] hash, out byte[] salt);
                client.PasswordHash = hash;
                client.PasswordSalt = salt;
            }

            _context.Client.Update(client);
            await _context.SaveChangesAsync();

            response.Status = true;
            response.Mensagem = "Usuário atualizado com sucesso.";
            response.Dados = ToDto(client);
            return response;
        }
    }
}
