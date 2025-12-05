using Backend.Models;
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

            var options = new RestClientOptions(settings.BaseUrl)
            {
                ThrowOnAnyError = false,
                MaxTimeout = 10000
            };

            _client = new RestClient(options);
        }

        public async Task<(string orderId, string qrCodeLink)> CriarCobrancaPixAsync(Client client, double valor, string referencia, Cacamba cacamba)
        {
            // PagSeguro usa centavos
            var valorEmCentavos = (int)(valor * 100);

            var request = new RestRequest("orders", Method.Post);
            request.AddHeader("accept", "application/json");
            request.AddHeader("Authorization", $"Bearer {_token}");

            var payload = new
            {
                reference_id = referencia,
                customer = new
                {
                    name = client.Name,
                    email = client.Email,
                    tax_id = client.Cpf
                },
                items = new[]
                {
                    new
                    {
                        reference_id = cacamba.Id,
                        name = cacamba.Codigo,
                        quantity = 1,
                        unit_amount = valorEmCentavos
                    }
                },
                qr_codes = new[]
                {
                    new
                    {
                        amount = new { value = valorEmCentavos },
                    }
        
                }
            };

            request.AddJsonBody(payload);

            var response = await _client.PostAsync(request);

            if (!response.IsSuccessful)
                throw new Exception($"Erro PagBank: {response.StatusCode} - {response.Content}");

            using var doc = JsonDocument.Parse(response.Content);
            var root = doc.RootElement;

            // pega o order_id
            string orderId = root.GetProperty("id").GetString()!;

            // pega o link do PNG do QR Code
            var qrCodes = root.GetProperty("qr_codes")[0];

            string qrCodeLink = qrCodes.GetProperty("links")
                                       .EnumerateArray()
                                       .First(l => l.GetProperty("rel").GetString() == "QRCODE.PNG")
                                       .GetProperty("href")
                                       .GetString()!;

            return (orderId, qrCodeLink);
        }

       public async Task<string?> ConsultarStatusPagBankAsync(string orderId)
        {
            var request = new RestRequest($"orders/{orderId}", Method.Get);
            request.AddHeader("accept", "application/json");
            request.AddHeader("Authorization", $"Bearer {_token}");

            var response = await _client.GetAsync(request);

            if (!response.IsSuccessful)
                return null;

            using var doc = JsonDocument.Parse(response.Content);
            var root = doc.RootElement;

            // Pega o status do primeiro pagamento/charge
            if (root.TryGetProperty("charges", out var charges) && charges.GetArrayLength() > 0)
            {
                return charges[0].GetProperty("status").GetString();
            }

            return null;
        }
    }
}
