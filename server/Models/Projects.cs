using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TaskFigma.Models
{
    public class Projects
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? id { get; set; }

        public string ProjectName { get; set; }

    }
}