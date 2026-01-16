using backend.Models;
using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PrecoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PrecoController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Preco/Listar
        // Sugestão: Client pode acessar pra mostrar "diária" no front
        [Authorize(Roles = "Admin,Client")]
        [HttpGet("Listar")]
        public async Task<ActionResult> Listar()
        {
            var response = new Response<List<Preco>>();
            try
            {
                var precos = await _context.Preco.AsNoTracking().ToListAsync();
                response.Status = true;
                response.Mensagem = "Lista de preços.";
                response.Dados = precos;
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Mensagem = "Erro ao listar preços: " + ex.Message;
                response.Dados = null;
            }
            return Ok(response);
        }

        // GET: api/Preco/5
        [Authorize(Roles = "Admin,Client")]
        [HttpGet("{id:int}")]
        public async Task<ActionResult> ObterPorId(int id)
        {
            var response = new Response<Preco>();
            try
            {
                var preco = await _context.Preco.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
                if (preco == null)
                {
                    response.Status = false;
                    response.Mensagem = "Preço não encontrado.";
                    response.Dados = null;
                    return Ok(response);
                }

                response.Status = true;
                response.Mensagem = "Preço encontrado.";
                response.Dados = preco;
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Mensagem = "Erro ao buscar preço: " + ex.Message;
                response.Dados = null;
            }
            return Ok(response);
        }

        // GET: api/Preco/PorTamanho?tamanho=0
        [Authorize(Roles = "Admin,Client")]
        [HttpGet("PorTamanho")]
        public async Task<ActionResult> ObterPorTamanho([FromQuery] Backend.Enum.CacambaTamanhoEnum tamanho)
        {
            var response = new Response<Preco>();
            try
            {
                var preco = await _context.Preco.AsNoTracking().FirstOrDefaultAsync(p => p.Tamanho == tamanho);
                if (preco == null)
                {
                    response.Status = false;
                    response.Mensagem = "Preço não encontrado para esse tamanho.";
                    response.Dados = null;
                    return Ok(response);
                }

                response.Status = true;
                response.Mensagem = "Preço encontrado.";
                response.Dados = preco;
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Mensagem = "Erro ao buscar preço: " + ex.Message;
                response.Dados = null;
            }
            return Ok(response);
        }

        // POST: api/Preco/Criar
        [Authorize(Roles = "Admin")]
        [HttpPost("Criar")]
        public async Task<ActionResult> Criar(PrecoCreateDTO dto)
        {
            var response = new Response<Preco>();
            try
            {
                // evita duplicar tamanho
                var jaExiste = await _context.Preco.AnyAsync(p => p.Tamanho == dto.Tamanho);
                if (jaExiste)
                {
                    response.Status = false;
                    response.Mensagem = "Já existe um preço cadastrado para esse tamanho.";
                    response.Dados = null;
                    return Ok(response);
                }

                var preco = new Preco
                {
                    Valor = dto.Valor,
                    Tamanho = dto.Tamanho
                };

                _context.Preco.Add(preco);
                await _context.SaveChangesAsync();

                response.Status = true;
                response.Mensagem = "Preço cadastrado com sucesso.";
                response.Dados = preco;
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Mensagem = "Erro ao cadastrar preço: " + ex.Message;
                response.Dados = null;
            }
            return Ok(response);
        }

        // PUT: api/Preco/Atualizar/5
        [Authorize(Roles = "Admin")]
        [HttpPut("Atualizar/{id:int}")]
        public async Task<ActionResult> Atualizar(int id, PrecoUpdateDTO dto)
        {
            var response = new Response<Preco>();
            try
            {
                var preco = await _context.Preco.FirstOrDefaultAsync(p => p.Id == id);
                if (preco == null)
                {
                    response.Status = false;
                    response.Mensagem = "Preço não encontrado.";
                    response.Dados = null;
                    return Ok(response);
                }

                if (dto.Tamanho.HasValue && dto.Tamanho.Value != preco.Tamanho)
                {
                    var tamanhoJaExiste = await _context.Preco.AnyAsync(p => p.Tamanho == dto.Tamanho.Value && p.Id != id);
                    if (tamanhoJaExiste)
                    {
                        response.Status = false;
                        response.Mensagem = "Já existe um preço cadastrado para esse tamanho.";
                        response.Dados = null;
                        return Ok(response);
                    }

                    preco.Tamanho = dto.Tamanho.Value;
                }

                if (dto.Valor.HasValue)
                    preco.Valor = dto.Valor.Value;

                _context.Preco.Update(preco);
                await _context.SaveChangesAsync();

                response.Status = true;
                response.Mensagem = "Preço atualizado com sucesso.";
                response.Dados = preco;
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Mensagem = "Erro ao atualizar preço: " + ex.Message;
                response.Dados = null;
            }
            return Ok(response);
        }

        // DELETE: api/Preco/Deletar/5
        [Authorize(Roles = "Admin")]
        [HttpDelete("Deletar/{id:int}")]
        public async Task<ActionResult> Deletar(int id)
        {
            var response = new Response<string>();
            try
            {
                var preco = await _context.Preco.FirstOrDefaultAsync(p => p.Id == id);
                if (preco == null)
                {
                    response.Status = false;
                    response.Mensagem = "Preço não encontrado.";
                    response.Dados = null;
                    return Ok(response);
                }

                _context.Preco.Remove(preco);
                await _context.SaveChangesAsync();

                response.Status = true;
                response.Mensagem = "Preço removido com sucesso.";
                response.Dados = null;
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Mensagem = "Erro ao deletar preço: " + ex.Message;
                response.Dados = null;
            }
            return Ok(response);
        }
    }
}
