using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TaskFigma.Models;
using TaskFigma.Services;

namespace TaskManagement2.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly TaskService _taskService;
        public TaskController(TaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpPost("save")]
        public async Task<ResponseModel<TaskFigmaClass>> SaveTask([FromBody] TaskFigmaClass task)
        {
            var response = new ResponseModel<TaskFigmaClass>();
            try
            {
                if (!ModelState.IsValid)
                {
                    response.Status = false;
                    response.Message = "Invalid Task Data";
                    return response;
                }

                var isTaskNew = string.IsNullOrEmpty(task.Id);
                var result = await _taskService.AddOrUpdateTaskAsync(task);

                response.Message = isTaskNew ? "Task Created Successfully!" : "Task Updated Successfully";
                response.Result = result;
                return response;
            }
            catch (Exception e)
            {
                response.Status = false;
                response.Message = e.Message;
                return response;
            }
        }

        [HttpGet("allTasks")]
        public async Task<ResponseModel<List<TaskFigmaClass>>> GetTasks([FromQuery] int page = 1, [FromQuery] int pageSize = 12)
        {
            var response = new ResponseModel<List<TaskFigmaClass>>();

            try
            {
                if (!ModelState.IsValid)
                {
                    response.Status = false;
                    response.Message = "Invalid Task Data";
                    return response;
                }

                var paginated = await _taskService.GetAllTasksAsync(page, pageSize);

                response.Message = "Tasks paginated successfully";
                response.Result = paginated.Items;
                response.Total = paginated.TotalCount;
                response.Page = page;
                response.PageSize = pageSize;

                return response;
            }
            catch (Exception e)
            {
                response.Status = false;
                response.Message = e.Message;
                return response;
            }
        }

        [HttpGet("projects")]
        public async Task<ResponseModel<List<Projects>>> GetProjects()
        {
            var response = new ResponseModel<List<Projects>>();
            try
            {
                if (!ModelState.IsValid)
                {
                    response.Status = false;
                    response.Message = "Invalid Task Data";
                    return response;
                }

                var projects = await _taskService.GetAllProjectsAsync();
                response.Message = "Projects fetched successfully!";
                response.Result = projects;
                return response;
            }
            catch (Exception e)
            {
                response.Status = false;
                response.Message = e.Message;
                return response;
            }
        }

        [HttpGet("users")]
        public async Task<ResponseModel<List<Users>>> GetUsers()
        {
            var response = new ResponseModel<List<Users>>();
            try
            {
                if (!ModelState.IsValid)
                {
                    response.Status = false;
                    response.Message = "Invalid Task Data";
                    return response;
                }

                var users = await _taskService.GetAllUsersAsync();
                response.Message = "Users fetched successfully!";
                response.Result = users;
                return response;
            }
            catch (Exception e)
            {
                response.Status = false;
                response.Message = e.Message;
                return response;
            }
        }


        [HttpGet("{id}")]
        public async Task<ResponseModel<TaskFigmaClass>> GetTaskById([FromRoute] string id)
        {
            var response = new ResponseModel<TaskFigmaClass>();
            try
            {
                if (!ModelState.IsValid)
                {
                    response.Status = false;
                    response.Message = "Invalid Task Data";
                    return response;
                }

                var task = await _taskService.GetTaskByIdAsync(id);

                //var taskWithDisplay = new
                //{
                //    task.Id,
                //    task.Title,
                //    task.Description,
                //    task.Alias,
                //    task.Assignee,
                //    task.Reporter,
                //    task.Status,
                //    task.Priority,
                //    task.DueDate,
                //    task.Attachments,
                //    task.CreatedAt,
                //    task.UpdatedAt,
                //    task.Comments,
                //    task.Project,
                //    ActivityLog = task.ActivityLog?.Select(log => new
                //    {
                //        log.Previous,
                //        log.Current,
                //        log.CreatedAt,
                //        log.PerformedBy,
                //        action = ((Enum)log.Action).GetDisplayName()
                //    })
                //};

                response.Result = task;
                response.Message = "Task fetched successfully";
                return response;
            }
            catch (Exception e)
            {
                response.Status = false;
                response.Message = e.Message;
                return response;
            }
        }


        [HttpPost("{taskId}/comment")]
        public async Task<ResponseModel<Comment>> AddOrUpdateComment(string taskId, [FromBody] Comment comment)
        {
            var response = new ResponseModel<Comment>();
            try
            {
                if (!ModelState.IsValid)
                {
                    response.Status = false;
                    response.Message = "Invalid Task Data";
                    return response;
                }

                response.Result = await _taskService.AddOrUpdateCommentAsync(taskId, comment);
                response.Message = string.IsNullOrEmpty(comment.Id)
                    ? "Comment added successfully"
                    : "Comment updated successfully";
                return response;
            }
            catch (Exception e)
            {
                response.Status = false;
                response.Message = e.Message;
                return response;
            }
        }

        [HttpPost("{taskId}/delete")]
        public async Task<ResponseModel<Comment>> DeleteComment(string taskId, [FromQuery] string commentId)
        {
            var response = new ResponseModel<Comment>();
            try
            {
                if (!ModelState.IsValid)
                {
                    response.Status = false;
                    response.Message = "Invalid Task Data";
                    return response;
                }

                response.Result = await _taskService.DeleteCommentAsync(taskId, commentId);
                response.Message = "Comment deleted successfully";
                return response;
            }
            catch (Exception e)
            {
                response.Status = false;
                response.Message = e.Message;
                return response;
            }
        }

        [HttpGet("pendingTask")]
        public async Task<ResponseModel<List<TaskFigmaClass>>> GetPendingTasks()
        {
            var response = new ResponseModel<List<TaskFigmaClass>>();
            try
            {
                response.Result = await _taskService.GetPendingTasksAsync();
                response.Message = "Pending Tasks fetched successfully";
                return response;
            }
            catch (Exception e)
            {
                response.Status = false;
                response.Message = e.Message;
                return response;
            }
        }

        [HttpGet("dueTask")]
        public async Task<ResponseModel<List<TaskFigmaClass>>> GetDueTasks()
        {
            var response = new ResponseModel<List<TaskFigmaClass>>();
            try
            {
                response.Result = await _taskService.GetDueTasksAsync();
                response.Message = "Due Tasks fetched successfully";
                return response;
            }
            catch (Exception e)
            {
                response.Status = false;
                response.Message = e.Message;
                return response;
            }
        }

        [HttpGet("status-counts")]
        public async Task<ActionResult<List<TaskFigmaClass>>> GetStatusCounts()
        {
            var statusCounts = await _taskService.GetTaskStatusCountsAsync();
            return Ok(statusCounts);
        }

    }
}
