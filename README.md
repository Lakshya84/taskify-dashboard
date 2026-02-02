🌐 Full Stack Web Application
This repository contains a full-stack web application organized in a clean monorepo structure. The frontend and backend are separated into dedicated folders, ensuring scalability, maintainability, and clear client–server boundaries.

📁 Project Structure
root/
├── client/   # Frontend (React + Vite)
├── server/   # Backend (ASP.NET Core Web API + MongoDB)
├── .gitignore
└── README.md


🚀 Tech Stack
Frontend
- React
- Vite
- TypeScript
- HTML5 / CSS3

Backend
- ASP.NET Core Web API (C#)
- MongoDB
- RESTful APIs

⚙️ Setup Instructions
1️⃣ Frontend Setup
cd client
npm install
npm run dev


Frontend runs at:
http://localhost:5173

2️⃣ Backend Setup
Ensure you have:
- .NET SDK installed
- MongoDB running locally or accessible via connection string
cd server/Backend
dotnet restore
dotnet run

Backend runs at:
https://localhost:5281
Swagger UI available at:
https://localhost:5281/swagger

🔐 Environment Configuration
MongoDB settings are defined in appsettings.json:
"MongoDbSettings": {
  "ConnectionString": "mongodb://localhost:27017",
  "DatabaseName": "MyAppDb"
}

🧠 Key Highlights
- Clean client–server separation
- RESTful API architecture
- MongoDB integration using official .NET driver
- Scalable folder structure for growth
- Git best practices (ignoring bin/, obj/, node_modules)

📌 Author
Lakshya Pandey
Aspiring Full Stack Developer
