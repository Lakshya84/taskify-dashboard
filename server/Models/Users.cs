using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TaskFigma.Models
{
    public class Users
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? id { get; set; }

        public string? name { get; set; }

    }
}