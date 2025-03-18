# Task Management API

## 📌 Overview
This is a Node.js and Express-based API for managing tasks. It allows users to create, read, update, and delete tasks, while implementing authentication using JWT. Tasks are prioritized using a Min-Heap (priority queue) and stored in a PostgreSQL database.

## 🚀 Features
- User authentication with JWT (Register & Login)
- CRUD operations for tasks (Create, Read, Update, Delete)
- Task sorting based on priority and timestamp using Min-Heap
- Middleware to protect routes using JWT authentication

## 📦 Requirements

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Postman](https://www.postman.com/) (for API testing)

## 📂 Installation & Setup

### 1️⃣ Clone the Repository
```sh
 git clone https://github.com/sadmaanwarshi/-House-of-MarkTech-assignment.git
 cd House-of-MarkTech-assignment
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env` file in the root directory and add the following:
```env
PORT=5000
DB_USER=your_pg_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASS=your_pg_password
DB_PORT=5432
JWT_SECRET=your_secret_key
```

### 4️⃣ Run Database Migration (Manually in PGAdmin)
Create a `users` and `tasks` table:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed')) NOT NULL,
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5️⃣ Start the Server
```sh
npm start
```
The server will run on `http://localhost:3000`

## 🔥 API Usage

### 🛠️ Authentication
#### 🔹 Register a User
**Endpoint:** `POST /api/register`
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
}
```

#### 🔹 Login
**Endpoint:** `POST /api/login`
```json
{
    "email": "john@example.com",
    "password": "securepassword"
}
```
**Response:**
```json
{
    "message": "Hello John Doe, start managing tasks",
    "token": "your-jwt-token"
}
```
Use this `token` for authentication in protected routes.

### 📌 Task Management
#### 🔹 Get All Tasks (Sorted by Priority & Timestamp)
**Endpoint:** `GET /api/tasks`
**Headers:**
```json
{
    "Authorization": "Bearer your-jwt-token"
}
```

#### 🔹 Create a Task
**Endpoint:** `POST /api/tasks`
```json
{
    "title": "Complete Project",
    "description": "Finish API development",
    "status": "pending",
    "priority": "high"
}
```

#### 🔹 Update Task (Mark as Completed)
**Endpoint:** `PUT /api/tasks/:id`
```json
{
    "status": "completed"
}
```

#### 🔹 Delete a Task
**Endpoint:** `DELETE /api/tasks/:id`

## 🔑 Using JWT in Postman
1. **Login** to get the JWT token.
2. **Copy the token** from the response.
3. In Postman, go to `Authorization` > Select `Bearer Token` > Paste the token.
4. Now you can access protected routes.

## 🛠 Technologies Used
- **Node.js & Express** – Backend Framework
- **PostgreSQL** – Database
- **bcrypt** – Password Hashing
- **jsonwebtoken (JWT)** – Authentication
- **express-validator** – Input Validation
- **Min-Heap (Priority Queue)** – Task Sorting

## 🎯 Future Enhancements
- Add User Roles (Admin, User)
- Implement Task Reminders & Notifications

## 📜 License
This project is licensed under the MIT License.

## Author
#### sadmaan warshi