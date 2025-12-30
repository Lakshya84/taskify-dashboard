using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Diagnostics;
using TaskFigma.Models;

namespace TaskFigma.Services

{
    public class TaskService
    {
        private readonly IMongoCollection<TaskFigmaClass> _tasks;
        private readonly IMongoCollection<Projects> _projects;
        private readonly IMongoCollection<Users> _users;

        public TaskService(IOptions<MongoDBSettings> mongoSettings)
        {
            var mongoClient = new MongoClient(mongoSettings.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(mongoSettings.Value.DatabaseName);
            _tasks = mongoDatabase.GetCollection<TaskFigmaClass>(mongoSettings.Value.TaskFigmaClass);
            _projects = mongoDatabase.GetCollection<Projects>("Projects");

            _users = mongoDatabase.GetCollection<Users>("Users");

        }

        public async Task<TaskFigmaClass> AddOrUpdateTaskAsync(TaskFigmaClass taskInput)
        {
            if (string.IsNullOrEmpty(taskInput.Project.id))
            {
                throw new ArgumentException("Project is required or invalid");
            }
            if (string.IsNullOrEmpty(taskInput.Title))
                throw new ArgumentException("Title is required");
            if (string.IsNullOrEmpty(taskInput.Reporter.id))
                throw new ArgumentException("Reporter is required");

            // Fetch Project from DB
            var project = await _projects.Find(p => p.id == taskInput.Project.id).FirstOrDefaultAsync();
            //Console.WriteLine($"project", project);
            if (project == null)
                throw new ArgumentException("Project not found");

            // Fetch Reporter from DB
            var reporter = await _users.Find(u => u.id == taskInput.Reporter.id).FirstOrDefaultAsync();
            if (reporter == null)
                throw new ArgumentException("Reporter not found");

            // Fetch Assignees from DB
            var assigneeIds = taskInput.Assignee.Select(a => a.id).ToList();
            var assignees = await _users.Find(u => assigneeIds.Contains(u.id)).ToListAsync();

            // create a task
            if (string.IsNullOrEmpty(taskInput.Id))
            {
                //taskInput.Id = ObjectId.GenerateNewId().ToString();
                taskInput.Project = project;
                taskInput.Reporter = reporter;
                taskInput.Assignee = assignees;
                var projectCode = project.ProjectName.Length >= 3 ? project.ProjectName.Substring(0, 3).ToUpper() : project.ProjectName.ToUpper();
                var taskCount = await _tasks.CountDocumentsAsync(t => t.Project.id == project.id);
                taskInput.Alias = $"{projectCode}-{(taskCount + 1).ToString("D3")}";
                taskInput.Status = taskInput.Status == StatusOfTask.Undefined ? StatusOfTask.Todo : taskInput.Status;
                taskInput.Priority = taskInput.Priority == PriorityOfTask.Undefined ? PriorityOfTask.Medium : taskInput.Priority;
                taskInput.CreatedAt = DateTime.UtcNow;
                taskInput.UpdatedAt = DateTime.UtcNow;
                taskInput.DueDate = taskInput.DueDate;

                taskInput.Comments = new List<Comment>();

                taskInput.ActivityLog = new List<TaskFigma.Models.Activity>
                {
                    new TaskFigma.Models.Activity
                    {
                        Action = ActivityAction.taskCreated,
                        Previous = null,
                        Current = taskInput.Title,
                        PerformedBy = reporter,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                await _tasks.InsertOneAsync(taskInput);
                return taskInput;
            }

            // update an existing task
            else
            {
                var existing = await _tasks.Find(t => t.Id == taskInput.Id).FirstOrDefaultAsync() ?? throw new ArgumentException("Task not found");

                var updates = Builders<TaskFigmaClass>.Update.Set(t => t.UpdatedAt, DateTime.UtcNow);

                var newActivities = new List<TaskFigma.Models.Activity>();

                if (existing.Title != taskInput.Title)
                {
                    updates = updates.Set(t => t.Title, taskInput.Title);
                    newActivities.Add(new TaskFigma.Models.Activity
                    {
                        Action = ActivityAction.titleRenamed,
                        Previous = existing.Title,
                        Current = taskInput.Title,
                        PerformedBy = reporter,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                if (existing.Description != taskInput.Description)
                {
                    updates = updates.Set(t => t.Description, taskInput.Description);
                    newActivities.Add(new TaskFigma.Models.Activity
                    {
                        Action = ActivityAction.updateDescription,
                        Previous = existing.Description,
                        Current = taskInput.Description,
                        PerformedBy = reporter,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                if (existing.Status != taskInput.Status && taskInput.Status != StatusOfTask.Undefined)
                {
                    updates = updates.Set(t => t.Status, taskInput.Status);
                    //updates = updates.Set("Status", taskInput.Status.ToString());

                    updates = updates.Set(t => t.Status, taskInput.Status);
                    newActivities.Add(new TaskFigma.Models.Activity
                    {
                        Action = ActivityAction.changeStatus,
                        Previous = existing.Status.ToString(),
                        Current = taskInput.Status.ToString(),
                        PerformedBy = reporter,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                if (existing.Priority != taskInput.Priority && taskInput.Priority != PriorityOfTask.Undefined)
                {
                    updates = updates.Set(t => t.Priority, taskInput.Priority);
                    newActivities.Add(new TaskFigma.Models.Activity
                    {
                        Action = ActivityAction.changePriority,
                        Previous = existing.Priority.ToString(),
                        Current = taskInput.Priority.ToString(),
                        PerformedBy = reporter,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                if (assignees.Any())
                    updates = updates.Set(t => t.Assignee, assignees);

                updates = updates.Set(t => t.Project, project).Set(t => t.Reporter, reporter);

                if (existing.DueDate != taskInput.DueDate)
                {
                    updates = updates.Set(t => t.DueDate, taskInput.DueDate);
                    newActivities.Add(new TaskFigma.Models.Activity
                    {
                        Action = ActivityAction.changeDuedate,
                        Previous = existing.DueDate.ToString(),
                        Current = taskInput.DueDate.ToString(),
                        PerformedBy = reporter,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                if (newActivities.Any())
                {
                    updates = updates.PushEach(t => t.ActivityLog, newActivities);
                }

                await _tasks.UpdateOneAsync(t => t.Id == taskInput.Id, updates);

                return await _tasks.Find(t => t.Id == taskInput.Id).FirstOrDefaultAsync();
            }
        }

        public class PaginatedResult<T>
        {
            public List<T> Items { get; set; }
            public int TotalCount { get; set; }
        }

        public async Task<PaginatedResult<TaskFigmaClass>> GetAllTasksAsync(
            int page, int pageSize
            )
        {
            try
            {
                var skip = (page - 1) * pageSize;

                var totalItems = await _tasks.CountDocumentsAsync(FilterDefinition<TaskFigmaClass>.Empty);

                var tasks = await _tasks.Find(_ => true).Skip(skip).Limit(pageSize).ToListAsync();

                return new PaginatedResult<TaskFigmaClass>
                {
                    Items = tasks,
                    TotalCount = (int)totalItems
                };

            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }

        public async Task<TaskFigmaClass> GetTaskByIdAsync(string taskId)
        {
            try
            {
                var task = await _tasks.Find(t => t.Id == taskId).FirstOrDefaultAsync();

                if (task == null)
                    throw new ArgumentException("Task not found");

                return task;
            }
            catch (Exception e)
            {
                throw new Exception(e.Message, e);
            }
        }

        public async Task<List<Projects>> GetAllProjectsAsync()
        {
            try
            {
                return await _projects.Find(_ => true).ToListAsync();
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }

        public async Task<Comment> AddOrUpdateCommentAsync(string taskId, Comment taskComment)
        {
            var task = await _tasks.Find(t => t.Id == taskId).FirstOrDefaultAsync()
                       ?? throw new ArgumentException("Task not found");

            var commenter = task.Assignee?.FirstOrDefault()
                            ?? throw new ArgumentException("No assignees found");

            if (string.IsNullOrEmpty(taskComment.Id))
            {
                taskComment.Id = ObjectId.GenerateNewId().ToString();
                taskComment.CreatedBy = commenter;
                taskComment.CreatedAt = DateTime.UtcNow;

                var update = Builders<TaskFigmaClass>.Update.Push(t => t.Comments, taskComment)
                    .Push(t => t.ActivityLog, new TaskFigma.Models.Activity
                    {
                        Action = ActivityAction.commented,
                        Previous = null,
                        Current = taskComment.CommentText,
                        PerformedBy = commenter,
                        CreatedAt = DateTime.UtcNow
                    });

                await _tasks.UpdateOneAsync(t => t.Id == taskId, update);
            }
            else
            {
                var existingComment = task.Comments.FirstOrDefault(c => c.Id == taskComment.Id);
                if (existingComment == null)
                    throw new ArgumentException("Comment not found");

                var filter = Builders<TaskFigmaClass>.Filter.And(
                    Builders<TaskFigmaClass>.Filter.Eq(t => t.Id, taskId),
                    Builders<TaskFigmaClass>.Filter.ElemMatch(t => t.Comments, c => c.Id == taskComment.Id)
                );

                // $ finds the first element related to the filter
                var update = Builders<TaskFigmaClass>.Update
                    .Set("Comments.$.CommentText", taskComment.CommentText)
                    .Set("Comments.$.UpdatedAt", DateTime.UtcNow)
                    .Push(t => t.ActivityLog, new TaskFigma.Models.Activity
                    {
                        Action = ActivityAction.editedComment,
                        Previous = existingComment.CommentText,
                        Current = taskComment.CommentText,
                        PerformedBy = commenter,
                        CreatedAt = DateTime.UtcNow
                    });

                await _tasks.UpdateOneAsync(filter, update);
            }

            return taskComment;
        }

        public async Task<Comment> DeleteCommentAsync(string taskId, string commentId)
        {
            try
            {
                var task = await _tasks.Find(t => t.Id == taskId).FirstOrDefaultAsync()
                           ?? throw new ArgumentException("Task not found");

                var commenter = task.Assignee?.FirstOrDefault()
                                ?? throw new ArgumentException("No assignees found");

                var comment = task.Comments.FirstOrDefault(c => c.Id == commentId)
                              ?? throw new ArgumentException("Comment not found");

                // filter task + comment
                var filter = Builders<TaskFigmaClass>.Filter.And(
                    Builders<TaskFigmaClass>.Filter.Eq(t => t.Id, taskId),
                    Builders<TaskFigmaClass>.Filter.ElemMatch(t => t.Comments, c => c.Id == commentId)
                );

                // remove comment + log activity
                var update = Builders<TaskFigmaClass>.Update
                    .PullFilter(t => t.Comments, c => c.Id == commentId)
                    .Push(t => t.ActivityLog, new TaskFigma.Models.Activity
                    {
                        Action = ActivityAction.deletedComment,

                        Previous = null,
                        //Previous = comment.CommentText,
                        Current = null,
                        PerformedBy = commenter,
                        CreatedAt = DateTime.UtcNow
                    });

                await _tasks.UpdateOneAsync(filter, update);

                return comment;
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }

        public async Task<List<Users>> GetAllUsersAsync()
        {
            try
            {
                return await _users.Find(_ => true).ToListAsync();
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }

        public async Task<List<TaskFigmaClass>> GetPendingTasksAsync()
        {
            try
            {
                var filterRes = await _tasks.Find(t => t.Status != (StatusOfTask)3).ToListAsync();
                return filterRes;
            } catch (Exception e)

            {
                throw new Exception(e.Message);
            }
        }

        public async Task<List<TaskFigmaClass>> GetDueTasksAsync()
        {
            try
            {
                var today = DateTime.UtcNow;

                // Filter: Status != 3 (not completed) AND DueDate < today
                var filterRes = await _tasks
                    .Find(t => t.Status != (StatusOfTask)3 && t.DueDate < today)
                    .ToListAsync();

                return filterRes;
            }
            catch (Exception e)

            {
                throw new Exception(e.Message);
            }
        }

        public async Task<List<CountDto>> GetTaskStatusCountsAsync()
        {
            var result = await _tasks.Aggregate()
                .Group(
                    task => task.Status,
                    g => new CountDto
                    {
                        Property = (int)g.Key,
                        Count = g.Count()
                    }
                )
                .ToListAsync();

            return result;
        }

    }
}
