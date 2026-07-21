# HR Management SaaS

A modern multi-tenant Human Resource Management System (HRMS) built using ASP.NET Core Web API and Next.js. The application enables organizations to manage employees, attendance, leave requests, and user roles through a secure, scalable Software-as-a-Service (SaaS) architecture.

## 🚀 Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

### Backend
- ASP.NET Core 8 Web API
- C#
- Entity Framework Core

### Database
- SQL Server

### Authentication & Security
- JWT Bearer Authentication
- BCrypt Password Hashing
- Role-Based Authorization

---

## ✨ Features

### Multi-Tenant Architecture
- Company-based data isolation
- Secure tenant separation

### Authentication
- User Login
- JWT Authentication
- Password Encryption (BCrypt)

### Employee Management
- Employee CRUD Operations
- Department Management
- Designation Management
- Employee Profile Management

### Attendance Management
- Employee Check-In
- Employee Check-Out
- Daily Attendance Records
- Attendance Dashboard

### Leave Management
- Leave Request Submission
- Leave Approval Workflow
- Leave Balance Tracking
- Leave History

### User Roles
- Admin
- HR Manager
- Employee

Each role has its own permissions and access level.

---

## 📂 Project Structure

```
HRManagementSaaS/
│
├── backend/
│   ├── Controllers/
│   ├── Models/
│   ├── DTOs/
│   ├── Services/
│   ├── Data/
│   └── Program.cs
│
└── frontend/
    ├── app/
    ├── components/
    ├── lib/
    ├── types/
    └── public/
```

---

## ⚙️ Prerequisites

- .NET 8 SDK
- Node.js (LTS)
- SQL Server Express / SQL Server
- Visual Studio 2022 or VS Code

---

## 🔧 Backend Setup

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

Backend URL

```
http://localhost:5243
```

Swagger

```
http://localhost:5243/swagger
```

---

## 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create a `.env.local` file inside the `frontend` folder.

```env
NEXT_PUBLIC_API_URL=http://localhost:5243/api
```

Frontend URL

```
http://localhost:3000
```

---

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| Admin | Full system management |
| HR Manager | Employee, Attendance & Leave Management |
| Employee | View profile, attendance, submit leave requests |

---

## 📌 Future Enhancements

- Payroll Management
- Performance Evaluation
- Recruitment Module
- Email Notifications
- Document Management
- Dashboard Analytics

---

## 📄 License

This project was developed for educational and portfolio purposes.
