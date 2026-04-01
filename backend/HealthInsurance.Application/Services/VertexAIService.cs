using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using HealthInsurance.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Google.Cloud.AIPlatform.V1;
using Google.Apis.Auth.OAuth2;
using Grpc.Auth;

namespace HealthInsurance.Application.Services;

public class VertexAIService(IConfiguration configuration) : IVertexAIService
{
    private readonly IConfiguration _configuration = configuration;

    public async Task<string> AnalyzeClaimComplianceAsync(string claimReason, string policyConditions, decimal amount)
    {
        var projectId = _configuration["VertexAI:ProjectId"];
        var location = _configuration["VertexAI:Location"] ?? "us-central1";
        var modelId = _configuration["VertexAI:Model"] ?? "gemini-1.5-flash";
        var keyFilePath = _configuration["VertexAI:KeyFile"] ?? "gcp-key.json";

        try
        {
            // 1. Initialize Credentials
            GoogleCredential credential;
            if (File.Exists(keyFilePath))
            {
                credential = GoogleCredential.FromFile(keyFilePath);
            }
            else
            {
                // Try relative to project root or bin if not found
                var alternativePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, keyFilePath);
                if (File.Exists(alternativePath))
                {
                    credential = GoogleCredential.FromFile(alternativePath);
                }
                else
                {
                    credential = await GoogleCredential.GetApplicationDefaultAsync();
                }
            }

            if (credential.IsCreateScopedRequired)
            {
                credential = credential.CreateScoped("https://www.googleapis.com/auth/cloud-platform");
            }

            // Determine ProjectId from credential if missing
            if (string.IsNullOrEmpty(projectId) && credential.UnderlyingCredential is ServiceAccountCredential sac)
            {
                projectId = sac.ProjectId;
            }

            if (string.IsNullOrEmpty(projectId))
            {
                return "Error: Vertex AI ProjectId is missing from configuration.";
            }

            // 2. Initialize Prediction Service Client using the SDK
            var clientBuilder = new PredictionServiceClientBuilder
            {
                Endpoint = $"{location}-aiplatform.googleapis.com",
                ChannelCredentials = credential.ToChannelCredentials()
            };
            var predictionServiceClient = await clientBuilder.BuildAsync();

            // 3. Construct the Model Name
            // Format: projects/{project}/locations/{location}/publishers/google/models/{model}
            string modelName = $"projects/{projectId}/locations/{location}/publishers/google/models/{modelId}";

            // 4. Create the Generation Request
            var prompt = $@"You are a Health Insurance Claim Adjudicator. 
Analyze the following claim against the customer's policy conditions.
Claim Reason: {claimReason}
Requested Amount: ${amount}
Policy Conditions/Pre-existing: {policyConditions}

Tasks:
1. Check if the claim reason matches any pre-existing conditions or exclusions.
2. Determine if the claim should be Approved, Rejected, or needs Manual Review.
3. Provide a clear reasoning for your decision.
4. Assign a Fraud Risk Score (1-10) based on the consistency of the claim.

Return your response in this EXACT format:
VERDICT: [Approved/Rejected/Manual Review]
REASONING: [Explain why]
RISK SCORE: [1-10]";

            var generateContentRequest = new GenerateContentRequest
            {
                Model = modelName,
                Contents = 
                {
                    new Content 
                    {
                        Role = "USER",
                        Parts = { new Part { Text = prompt } }
                    }
                },
                GenerationConfig = new GenerationConfig
                {
                    Temperature = 0.2f,
                    TopP = 0.8f,
                    TopK = 40
                }
            };

            // 5. Call the Vertex AI API via SDK
            GenerateContentResponse response = await predictionServiceClient.GenerateContentAsync(generateContentRequest);

            // 6. Extract the result
            if (response.Candidates == null || response.Candidates.Count == 0 || response.Candidates[0].Content == null)
            {
                return "No adjudication results received from AI.";
            }

            var aiResponseContent = response.Candidates[0].Content.Parts[0].Text;
            return aiResponseContent ?? "No adjudication results received.";
        }
        catch (Exception ex)
        {
            return $"Error: Vertex AI SDK Exception: {ex.Message}";
        }
    }
}
