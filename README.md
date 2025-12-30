\# Full Stack Web Application



This repository contains a \*\*full-stack web application\*\* with a clean monorepo structure.  

The frontend and backend are maintained in separate folders for better scalability and maintainability.



---



\## 📁 Project Structure



root/

├── client/ # Frontend (React + Vite)

├── server/ # Backend (ASP.NET Core Web API + MongoDB)

├── .gitignore

└── README.md





\## 🚀 Tech Stack



\### Frontend

\- React

\- Vite

\- TypeScript

\- HTML5 / CSS3



\### Backend

\- ASP.NET Core Web API (C#)

\- MongoDB

\- RESTful APIs





\## ⚙️ Setup Instructions



\### 1️⃣ Frontend Setup



cd client

npm install

npm run dev

The frontend will run on:



arduino

http://localhost:5173



2️⃣ Backend Setup

Make sure:



.NET SDK is installed



MongoDB is running locally or accessible via a connection string



cd server/Backend

dotnet restore

dotnet run

The backend will run on:



Arduino: 

https://localhost:5281



Swagger UI:

https://localhost:5281/swagger





🔐 Environment Configuration

MongoDB settings are defined in:



appsettings.json





Example:



"MongoDbSettings": {

&nbsp; "ConnectionString": "mongodb://localhost:27017",

&nbsp; "DatabaseName": "MyAppDb"

}





🧠 Key Highlights

Clean client–server separation



RESTful API architecture



MongoDB integration using the official .NET driver



Scalable folder structure



Git best practices followed (bin/, obj/, node\_modules ignored)



📌 Author

Lakshya Pandey

Aspiring Full Stack Developer

