using System.Collections;
using Backend.Controllers;
using Backend.Data;
using Backend.Services.AgendamentoService;
using Backend.Services.AuthService;
using Backend.Services.BackgroundServices;
using Backend.Services.CacambaService;
using Backend.Services.NotificationService;
using Backend.Services.PagamentoService;
using Backend.Services.PagBank;
using Backend.Services.SenhaService;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------------------------------------------------------
// 🔥 1) Carregar o arquivo .env (antes de qualquer configuração)
// -----------------------------------------------------------------------------
Env.Load(); // carrega variáveis do .env


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

    originalJson = originalJson.Replace("${" + key + "}", value);
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
builder.Services.AddScoped<CacambaService>();

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
    db.Database.Migrate();
}

// Swagger só no dev
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
