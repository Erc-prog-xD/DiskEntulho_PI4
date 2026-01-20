using System.Collections;
using Backend.Controllers;
using Backend.Data;
using Backend.Services.AdminService;
using Backend.Services.AgendamentoService;
using Backend.Services.AuthService;
using Backend.Services.BackgroundServices;
using Backend.Services.CacambaService;
using Backend.Services.NotificationService;
using Backend.Services.PagamentoService;
using Backend.Services.PagBank;
using Backend.Services.SenhaService;
using Backend.Services.UsuarioService;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------------------------------------------------------
// 🔥 1) Carregar o arquivo .env (Busca Recursiva)
// -----------------------------------------------------------------------------
// Função local para encontrar o .env onde quer que ele esteja na árvore de pastas
var currentDirectory = Directory.GetCurrentDirectory();
var envLoaded = false;

// Tenta subir até 6 níveis de diretório para achar o .env
for (int i = 0; i < 6; i++)
{
    var envPath = Path.Combine(currentDirectory, ".env");
    
    if (File.Exists(envPath))
    {
        DotNetEnv.Env.Load(envPath);
        Console.WriteLine($"[ENV] 🟢 Carregado de: {envPath}");
        envLoaded = true;
        break;
    }

    var parent = Directory.GetParent(currentDirectory);
    if (parent == null) break;
    currentDirectory = parent.FullName;
}

if (!envLoaded)
{
    Console.WriteLine($"[ENV] 🔴 Arquivo .env não encontrado. Certifique-se que ele existe na raiz do projeto.");
}

// -----------------------------------------------------------------------------
// 2) Expandir ${VARIAVEL} do appsettings.json usando as variáveis do ambiente
// -----------------------------------------------------------------------------
var originalJson = File.ReadAllText("appsettings.json");

// para cada variável de ambiente, substituir ${NOME} no JSON
foreach (DictionaryEntry envVar in Environment.GetEnvironmentVariables())
{
    var key = envVar.Key?.ToString();
    var value = envVar.Value?.ToString() ?? string.Empty;

    if (string.IsNullOrWhiteSpace(key))
        continue;

    // Apenas substitui se encontrar a chave no formato ${CHAVE}
    if (originalJson.Contains("${" + key + "}"))
    {
        originalJson = originalJson.Replace("${" + key + "}", value);
    }
}

// salvar em um appsettings gerado em tempo de execução
var runtimeAppsettingsPath = "appsettings.runtime.json";
File.WriteAllText(runtimeAppsettingsPath, originalJson);

// agora adicionamos esse arquivo já processado na Configuration
builder.Configuration
    .AddJsonFile(runtimeAppsettingsPath, optional: false, reloadOnChange: true)
    .AddEnvironmentVariables();



// -----------------------------------------------------------------------------
// Serviços essenciais
// -----------------------------------------------------------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();

// -----------------------------------------------------------------------------
// Serviços próprios da aplicação
// -----------------------------------------------------------------------------
builder.Services.AddScoped<IAuthInterface, AuthService>();
builder.Services.AddScoped<ISenhaInterface, SenhaService>();
builder.Services.AddScoped<IPagamentoInterface, PagamentoService>();
builder.Services.AddScoped<IAgendamentoInterface, AgendamentoService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAdminInterface, AdminService>();
builder.Services.AddScoped<IUsuarioInterface, UsuarioService>();
builder.Services.AddScoped<ICacambaInterface, CacambaService>();

// Background services
builder.Services.AddHostedService<AgendamentoExpirationService>();
builder.Services.AddHostedService<PagamentoStatusService>();

// -----------------------------------------------------------------------------
// Configura PagBankSettings
// -----------------------------------------------------------------------------
builder.Services.Configure<PagBankSettings>(builder.Configuration.GetSection("PagBank"));

builder.Services.AddSingleton<PagBankService>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<PagBankSettings>>().Value;
    return new PagBankService(settings);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var originsRaw = builder.Configuration["FRONTEND_ORIGINS"] ?? "http://localhost:3000";
        var origins = originsRaw
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithOrigins(origins);

        // Só use se você fizer requests com credentials (cookies/Authorization cross-site).
        // Se não usa, deixe comentado.
        // policy.AllowCredentials();
    });
});

// -----------------------------------------------------------------------------
// Banco de dados
// -----------------------------------------------------------------------------
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null
        )
    );
});

// -----------------------------------------------------------------------------
// Swagger com autenticação JWT
// -----------------------------------------------------------------------------
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
    {
        Description = "Autorização Bearer {token}, use: Bearer {token}",
        In = ParameterLocation.Header,
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });

    options.OperationFilter<SecurityRequirementsOperationFilter>();
});

// -----------------------------------------------------------------------------
// Autenticação JWT
// -----------------------------------------------------------------------------
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
      var tokenKey = builder.Configuration["AppSettings:Token"];
        if (string.IsNullOrWhiteSpace(tokenKey) || tokenKey.Length < 16)
        {
            if (!builder.Environment.IsDevelopment())
                throw new InvalidOperationException("AppSettings:Token ausente ou inválido.");

            Console.WriteLine($"[AUTH ALERT] Token JWT inválido: '{tokenKey}'");
            tokenKey = "chave_fallback_temporaria_para_debug_apenas_123456";
        }

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(tokenKey)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// -----------------------------------------------------------------------------
// Autorização
// -----------------------------------------------------------------------------
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim("isAdmin", "True"));
});

// -----------------------------------------------------------------------------
// Pipeline da aplicação
// -----------------------------------------------------------------------------
var app = builder.Build();

// Executa migrations automaticamente
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    if ((await db.Database.GetPendingMigrationsAsync()).Any())
    {
        db.Database.Migrate();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();