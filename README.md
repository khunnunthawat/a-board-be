# 🛳 aBoard - NestJS API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Introduction

aBoard is a backend API built with **NestJS** and **TypeORM**, using **PostgreSQL** as the database and **Docker** for containerized deployment. It also integrates **pgAdmin4** for database management.

## 📌 Features

- ✅ **NestJS** framework for backend development
- ✅ **TypeORM** for database management
- ✅ **PostgreSQL** database with Docker support
- ✅ **pgAdmin4** for managing the database
- ✅ **User authentication and authorization**
- ✅ **CRUD operations for users, posts, and comments**
- ✅ **CORS enabled for frontend communication**
- ✅ **Environment variables for configuration**
- ✅ **Docker Compose setup for easy deployment**
- ✅ **Seamless integration with the frontend**

## 🔗 Project Repositories

| Component                                  | Repository URL                                                |
| ------------------------------------------ | ------------------------------------------------------------- |
| **Backend (NestJS, TypeORM, PostgreSQL)**  | [aBoard Backend](https://github.com/khunnunthawat/a-board-be) |
| **Frontend (Next.js, React, TailwindCSS)** | [aBoard Frontend](https://github.com/khunnunthawat/a-board)   |

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## 📦 Installation

Prerequisites

- Node.js 20.x (Recommended)

### **Clone the Repository**

```bash
git clone https://github.com/khunnunthawat/a-board-be
cd a-board-be
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and configure your database settings:

```env
# App Configuration
PORT=3004
FRONTEND_URL=http://localhost:3000

# Database Configuration (PostgreSQL)
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=postgres

# Docker Configuration
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin
```

---

## 🐳 Running PostgreSQL & pgAdmin4 with Docker

To run **PostgreSQL and pgAdmin4**, use Docker Compose.

### **1️⃣ Start Docker Containers**

Run the following command to start the database and pgAdmin:

```bash
docker-compose up -d
```

### **2️⃣ Check Running Containers**

```bash
docker ps
```

### **3️⃣ Access pgAdmin4**

- Open: **http://localhost:5050**
- Login with:
  - **Email:** `admin@example.com`
  - **Password:** `admin`
- Add a new server:
  - **Name:** `postgres`
  - **Host:** `db`
  - **Port:** `5432`
  - **Username:** `postgres`
  - **Password:** `postgres`

---

## 🚀 Running the NestJS Backend

### **Start the Development Server**

```bash
npm run start
```

- Open API at: **`http://localhost:3004`**

### **Run in Watch Mode (Auto-restart)**

```bash
npm run start:dev
```

## Run tests

```bash
# unit tests
$ npm run test
```

---

### **Database Connection Issues**

Check if **PostgreSQL** is running in Docker:

```bash
docker ps
```

If the database is not running, restart it:

```bash
docker-compose up -d
```

---

## 🔥 API Endpoints

### **User API**

| Method | Endpoint       | Description                          |
| ------ | -------------- | ------------------------------------ |
| `POST` | `/user/signin` | Create a new user and Sign in a user |
| `GET`  | `/user`        | Get all users                        |
| `GET`  | `/user/:id`    | Get user by ID                       |

### **Post API**

| Method   | Endpoint             | Description                                                           |
| -------- | -------------------- | --------------------------------------------------------------------- |
| `GET`    | `/post`              | Get all posts (optional filters: `?search=abc&community=History`)     |
| `GET`    | `/post/:postId`      | Get post by ID                                                        |
| `POST`   | `/post`              | Create a new post                                                     |
| `PATCH`  | `/post/:postId`      | Update a post (requires `userId` in body)                             |
| `DELETE` | `/post/:postId`      | Delete a post (requires `userId` in body)                             |
| `GET`    | `/post/user/:userId` | Get posts by user (optional filters: `?search=abc&community=History`) |

### **Comment API**

| Method   | Endpoint                | Description                      |
| -------- | ----------------------- | -------------------------------- |
| `GET`    | `/comment/:commentId`   | Get comment by ID                |
| `POST`   | `/comment`              | Create a new comment             |
| `PATCH`  | `/comment/:commentId`   | Update a comment                 |
| `DELETE` | `/comment/:commentId`   | Delete a comment                 |
| `GET`    | `/comment/post/:postId` | Get comments for a specific post |

---

## 📜 License

This project is licensed under the **MIT License**.
