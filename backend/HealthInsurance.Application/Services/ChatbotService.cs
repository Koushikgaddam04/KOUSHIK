using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using HealthInsurance.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace HealthInsurance.Application.Services;

public class ChatbotService(HttpClient httpClient, IConfiguration configuration) : IChatbotService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly IConfiguration _configuration = configuration;

    public async Task<string> GetChatResponseAsync(string userMessage)
    {
        var apiKey = _configuration["Groq:ApiKey"];
        var model = _configuration["Groq:Model"] ?? "llama-3.3-70b-versatile";
        var baseUrl = _configuration["Groq:BaseUrl"] ?? "https://api.groq.com/openai/v1";

        if (string.IsNullOrEmpty(apiKey))
        {
            return "Chatbot is currently offline (API key missing).";
        }

        var requestBody = new
        {
            model = model,
            messages = new[]
            {
                new { role = "system", content = "You are the NexusCare AI Support Assistant. Your primary goal is to guide customers step-by-step through their problems. Whether it's filing a claim, checking policy status, or updating details, break it down for them. Use a professional, helpful tone. Keep responses relatively concise." },
                new { role = "user", content = userMessage }
            },
            temperature = 0.7
        };

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/chat/completions");
            request.Headers.Add("Authorization", $"Bearer {apiKey}");
            request.Content = JsonContent.Create(requestBody);

            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                return $"Error from AI: {response.StatusCode} - {error}";
            }

            var jsonResponse = await response.Content.ReadFromJsonAsync<JsonElement>();
            var aiContent = jsonResponse.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

            return aiContent ?? "I'm sorry, I couldn't generate a response.";
        }
        catch (Exception ex)
        {
            return $"AI Service Exception: {ex.Message}";
        }
    }
}
