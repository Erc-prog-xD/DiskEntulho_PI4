namespace Backend.Services.PagBank
{
    public class PagBankSettings
    {
        public string AccessToken { get; set; } = string.Empty;
        public string Environment { get; set; } = "Sandbox";

        public string BaseUrl =>
            Environment.Equals("Sandbox", StringComparison.OrdinalIgnoreCase)
                ? "https://sandbox.api.pagseguro.com/"
                : "https://api.pagseguro.com/";
    }
}
