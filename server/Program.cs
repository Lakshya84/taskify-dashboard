using Microsoft.AspNetCore.Builder;
using TaskFigma.Models;
using TaskFigma.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.Configure<MongoDBSettings>(
	builder.Configuration.GetSection("MongoDBSettings"));

builder.Services.AddScoped<TaskService>();

builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowReactApp",

		policy => policy.WithOrigins("http://localhost:5173")
						.AllowAnyHeader()
						.AllowAnyMethod());
});

builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.

if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

app.Run();

