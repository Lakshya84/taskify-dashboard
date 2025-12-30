namespace TaskFigma.Models
{
    public class ResponseModel<T>
    {
        public bool Status { get; set; } = true;
        public string Message { get; set; }
        public T? Result { get; set; }
        public int? Total { get; set; }
        public int? PageSize { get; set; }
        public int? Page { get; set; }
    }
}