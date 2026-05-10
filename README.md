# 📝 Personal Blog API

A RESTful API for a personal blog platform built with Node.js, Express, and MySQL (Sequelize ORM). Supports user authentication, posts, comments, likes, and real-time session tracking.

---

## 🧰 Tech Stack

- **Runtime:** Node.js ≥ 18
- **Framework:** Express 5
- **Database:** MySQL (via Sequelize 6)
- **Auth:** JWT (jsonwebtoken) + bcrypt
- **Validation:** Joi
- **Dev tool:** nodemon

---

## 📁 Project Structure

```
personal-blog/
├── app/
│   ├── configs/        # Database configuration
│   ├── controllers/    # Route handler logic
│   ├── middlewares/    # Auth middleware
│   ├── models/         # Sequelize models
│   ├── routes/         # Express routers
│   ├── services/       # Token manager & realtime sync
│   ├── utilities/      # Logger
│   └── server.js       # Entry point
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) **≥ 18**
- [MySQL](https://dev.mysql.com/downloads/) **≥ 5.7** or **MySQL 8**
- npm (bundled with Node.js)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/datjj0504-personal-project/personal-blog.git
cd personal-blog
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the MySQL database

Log in to your MySQL server and create an empty database:

```sql
CREATE DATABASE datnt_js CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> Tables are created **automatically** by Sequelize on first startup — no SQL scripts needed.

### 4. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Server
SERVER_PORT=8081
IP_ADDRESS=localhost
BASE_PATH=/datnt/blog/server

# Auth
JWT_SECRET=your_super_secret_jwt_key_here
TOKEN_EXPIRATION_HOURS=0.5

# Sequelize sync mode: false = safe (default), true = alter existing tables (use with caution)
DB_SYNC_ALTER=false
```

> ⚠️ **Note:** Database host/port/credentials are hardcoded in `app/configs/db.config.js` (default: `localhost:3307`, user `root`, password `123456`, database `datnt_js`). Update that file directly if your setup differs.

### 5. Start the server

**Development (with auto-reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

The server will start on `http://localhost:8081` by default.

You should see output like:

```
[...] [INFO ] [SERVER         ]: Connected to MySQL successfully!
[...] [INFO ] [SERVER         ]: Tables checked (safe sync mode)
[...] [INFO ] [SERVER         ]: Server is running on http://localhost:8081
```

---

## 🔌 API Reference

All routes are prefixed with `BASE_PATH` (default: `/datnt/blog/server`).

### Auth

| Method | Endpoint              | Auth | Description       |
|--------|-----------------------|------|-------------------|
| POST   | `/auth/register`      | ❌   | Register new user |
| POST   | `/auth/login`         | ❌   | Login             |
| POST   | `/auth/logout`        | ✅   | Logout            |

### Posts

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | `/posts/create`       | ✅   | Create a post            |
| POST   | `/posts/update`       | ✅   | Update own post          |
| DELETE | `/posts/delete`       | ✅   | Delete own post          |
| POST   | `/posts/like`         | ✅   | Toggle like/unlike       |
| POST   | `/posts/comment`      | ✅   | Comment on a post        |

### Feeds

| Method | Endpoint                           | Auth | Description                        |
|--------|------------------------------------|------|------------------------------------|
| GET    | `/feeds/resources`                 | ✅   | Get all posts (feed)               |
| GET    | `/feeds/resources?personal=true`   | ✅   | Get only your own posts            |

### System

| Method | Endpoint          | Auth | Description  |
|--------|-------------------|------|--------------|
| GET    | `/system/health`  | ❌   | Health check |

### Authentication

Protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📬 Example Requests

### Register

```bash
curl -X POST http://localhost:8081/datnt/blog/server/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "datnt", "password": "Secret@123"}'
```

**Password rules:** minimum 6 characters, must include uppercase, lowercase, number, and special character (`@$!%*?&`).

### Login

```bash
curl -X POST http://localhost:8081/datnt/blog/server/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "datnt", "password": "Secret@123"}'
```

### Create a Post

```bash
curl -X POST http://localhost:8081/datnt/blog/server/posts/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello world!"}'
```

---

## 🔐 Session Management

- Each user can have **only one active session** at a time.
- Tokens auto-expire based on `TOKEN_EXPIRATION_HOURS`.
- Active sessions are synced to the `tb_manage_token_realtime` table every 5 seconds for visibility.
- The realtime table is **cleared on every server restart**.

---

## 🐳 Docker Setup (MySQL only)

Run MySQL in a Docker container while Node.js runs on your local machine as normal. Make sure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed before proceeding.

**Step 1: Start the MySQL container**

```bash
docker run -d \
  --name personal-blog-db \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=datnt_js \
  -e MYSQL_ROOT_HOST=% \
  -p 3307:3306 \
  --restart unless-stopped \
  mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci
```

**Step 2: Verify the container is running**

```bash
docker ps
# personal-blog-db should appear with status "Up"
```

**Step 3: Wait ~15 seconds for MySQL to finish initializing, then start the server**

```bash
npm run dev
```

**Stop the container (data is preserved):**

```bash
docker stop personal-blog-db
```

**Start it again later:**

```bash
docker start personal-blog-db
```

**Remove the container entirely:**

```bash
docker rm -f personal-blog-db
```

---

## 🗄️ Database Reference (SQL)

Sequelize creates all tables automatically on startup. The schema below is for **reference only** — useful if you need to inspect, seed, or recreate tables manually.

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS datnt_js
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE datnt_js;

-- Users
CREATE TABLE IF NOT EXISTS `ListUsers` (
  `user_id`         INT          NOT NULL AUTO_INCREMENT,
  `username`        VARCHAR(50)  NOT NULL,
  `password`        VARCHAR(255) NOT NULL,
  `password_encode` VARCHAR(255) NOT NULL DEFAULT \'\',
  `createdAt`       DATETIME     NOT NULL,
  `updatedAt`       DATETIME     NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_user_id_username` (`user_id`, `username`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Posts
CREATE TABLE IF NOT EXISTS `posts` (
  `id`         INT      NOT NULL AUTO_INCREMENT,
  `user_id`    INT      NOT NULL,
  `content`    TEXT,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comments
CREATE TABLE IF NOT EXISTS `comments` (
  `id`         INT      NOT NULL AUTO_INCREMENT,
  `post_id`    INT      NOT NULL,
  `user_id`    INT      NOT NULL,
  `content`    TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Post likes
CREATE TABLE IF NOT EXISTS `post_likes` (
  `user_id`    INT      NOT NULL,
  `post_id`    INT      NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Login history
CREATE TABLE IF NOT EXISTS `tb_info_login` (
  `time`  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user`  VARCHAR(50) NOT NULL,
  `token` TEXT        NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logout history
CREATE TABLE IF NOT EXISTS `tb_info_logout` (
  `time`  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user`  VARCHAR(50) NOT NULL,
  `token` TEXT        NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Realtime token tracking (cleared on every server restart)
CREATE TABLE IF NOT EXISTS `tb_manage_token_realtime` (
  `id`                INT          NOT NULL AUTO_INCREMENT,
  `username`          VARCHAR(50)  NOT NULL,
  `token`             VARCHAR(512) NOT NULL,
  `expires_at`        DATETIME     NOT NULL,
  `remaining_seconds` INT          NOT NULL DEFAULT 0,
  `created_at`        DATETIME     NOT NULL,
  `updated_at`        DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🛠️ Common Issues

**`ER_ACCESS_DENIED_ERROR`** — Wrong DB username/password in `.env` or `db.config.js`.

**`ECONNREFUSED` on port 3307** — Your MySQL might be running on port 3306. Update the port in `app/configs/db.config.js`.

**`Token has expired or is invalid`** — Log in again to get a fresh token.

**Tables not created** — Make sure the database exists before starting. Sequelize will create tables but not the database itself.

---

## 📄 License

ISC © [datnt](https://github.com/datjj0504-personal-project)