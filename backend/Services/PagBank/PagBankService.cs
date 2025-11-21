using RestSharp;
using System.Text.Json;

namespace Backend.Services.PagBank
{
    public class PagBankService
    {
        private readonly string _token;
        private readonly RestClient _client;

        public PagBankService(PagBankSettings settings)
        {
            _token = settings.AccessToken;

            var options = new RestClientOptions(settings.BaseUrl + "orders")
            {
                ThrowOnAnyError = false,
                MaxTimeout = 10000
            };

            _client = new RestClient(options);
        }

        public async Task<string> CriarCobrancaPixAsync(double valor, string referencia)
        {
            // PagSeguro usa centavos
            var valorEmCentavos = (int)(valor * 100);

            var request = new RestRequest();
            request.AddHeader("accept", "application/json");
            request.AddHeader("Authorization", $"Bearer {_token}");

            var payload = new
            {
                reference_id = referencia,
                customer = new
                {
                    name = "teste",
                    email = "teste@gmail.com",
                    tax_id = "08423690318"
                },
                items = new[]
                {
                    new
                    {
                        reference_id = "item-001",
                        name = "Serviço/Produto",
                        quantity = 1,
                        unit_amount = valorEmCentavos
                    }
                },
                qr_codes = new[]
                {
                    new
                    {
                        amount = new { value = valorEmCentavos }
                    }
                }
            };

            request.AddJsonBody(payload);

            var response = await _client.PostAsync(request);

            if (!response.IsSuccessful)
                throw new Exception($"Erro PagBank: {response.StatusCode} - {response.Content}");

            using var doc = JsonDocument.Parse(response.Content);
            var root = doc.RootElement;

            string orderId = root.GetProperty("id").GetString()!;

            return (orderId);
        }
    }
}
