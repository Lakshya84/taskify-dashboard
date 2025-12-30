using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Buffers.Text;
using System.ComponentModel.DataAnnotations;
namespace TaskFigma.Models

{
    public enum StatusOfTask
    {
        Undefined,
        Todo,
        InProgress,
        Done

    }

    public enum PriorityOfTask
    {
        Undefined,
        Low,
        Medium,
        High

    }

    public enum ActivityAction
    {
        Undefined,

        [Display(Name = "added a new task")]
        taskCreated,

        [Display(Name = "changes priority")]
        changePriority,

        [Display(Name = "changes status")]
        changeStatus,

        [Display(Name = "renamed the task name")]
        titleRenamed,

        [Display(Name = "changes the task description")]
        updateDescription,

        [Display(Name = "added a comment")]
        commented,

        [Display(Name = "changes a comment")]
        editedComment,

        [Display(Name = "changes due date")]
        changeDuedate,

        [Display(Name = "changes attachment")]
        changeAttachment,

        [Display(Name = "changes assignees")]
        changeAssignee,

        [Display(Name = "changes reporters")]
        changeReporter,

        [Display(Name = "deletes a comment")]
        deletedComment

    }

    public class Comment
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string? Id { get; set; }
        public Users CreatedBy { get; set; }
        public string CommentText { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

    }

    public class Activity
    {
        [BsonRepresentation(BsonType.String)]
        public ActivityAction Action { get; set; }
        public string? Previous { get; set; }
        public string? Current { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Users PerformedBy { get; set; }
        [BsonIgnore]
        public string ActionDisplay => ((Enum)Action).GetDisplayName();

    }

    public class TaskFigmaClass
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public Projects? Project { get; set; }

        [Required]
        public string Title { get; set; }

        [BsonIgnoreIfNull]
        public string? Description { get; set; }

        public string? Alias { get; set; }

        public List<Users>? Assignee { get; set; }

        // createdBy and Reporter will be same
        public Users? Reporter { get; set; }

        [BsonRepresentation(BsonType.String)]
        public StatusOfTask Status { get; set; }

        [Required]
        [BsonRepresentation(BsonType.String)]

        public PriorityOfTask Priority { get; set; }

        [Required]
        [BsonRepresentation(BsonType.DateTime)]
        public DateTime DueDate { get; set; }

        [BsonIgnoreIfNull]
        public List<string> Attachments { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [BsonIgnoreIfNull]
        public List<Comment>? Comments { get; set; }

        public List<Activity>? ActivityLog { get; set; }

        [BsonIgnore]
        public int Count { get; set; }

    }
}

