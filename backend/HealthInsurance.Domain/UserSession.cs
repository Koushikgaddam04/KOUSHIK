namespace HealthInsurance.Domain
{
    /// <summary>
    /// Global context to store the current user ID.
    /// NOTE: In a multi-user production environment, this should be handled via 
    /// IHttpContextAccessor or a Scoped Service to avoid concurrency issues.
    /// </summary>
    public static class UserSession
    {
        public static int CurrentUserId { get; set; } = 1;
    }
}
