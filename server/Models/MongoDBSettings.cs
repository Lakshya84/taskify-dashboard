namespace TaskFigma.Models
{
    public class MongoDBSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
        public string TaskFigmaClass { get; set; } = null!;

    }
}
