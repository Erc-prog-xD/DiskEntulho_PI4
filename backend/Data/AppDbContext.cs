using Backend.Enum;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<Client> Client { get; set; }
        public DbSet<Pagamento> Pagamento { get; set; }
        public DbSet<Cacamba> Cacamba { get; set; }
        public DbSet<Agendamento> Agendamento { get; set; }
        public DbSet<Preco> Preco { get; set; }

        public DbSet<AgendamentoNotification> AgendamentoNotification {get ;set;}
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 🔹 Diz ao EF que Endereco faz parte de Agendamento
            modelBuilder.Entity<Agendamento>().OwnsOne(a => a.Endereco);

        }
    }
}