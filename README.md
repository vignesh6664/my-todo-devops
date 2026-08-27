# DevOps Todo App

This is a full-stack Todo application (React, Express, Postgres) that I containerized to practice DevOps workflows, Docker, and CI/CD.

## Architecture

The app uses a 3-tier architecture orchestrated entirely via `docker-compose`:

* **Frontend:** A React (Vite) app compiled into static files and served by an **Nginx** web server. Nginx also acts as a reverse proxy, forwarding any browser requests starting with `/api` directly to the backend container.
* **Backend:** A Node.js / Express API that handles business logic and talks to the database using Prisma ORM.
* **Database:** A PostgreSQL container with a mapped volume (`pgdata`) to ensure Todo items are permanently saved even if the container is destroyed.

## How to Run

Make sure you have Docker installed and running on your machine.

1. Spin up the entire stack in the background:
   ```bash
   docker-compose up --build -d
   ```
2. On your very first run, the database will be completely empty. Run this command to execute the database migrations and create the tables:
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

**Services & Ports:**
* **Frontend UI:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** `localhost:8080` (Internal Docker network)
* **PostgreSQL:** `localhost:5433` (Exposed on 5433 to avoid conflicts with any local DBs)

---

## Issues Faced & Fixes

While containerizing this application, I ran into a few classic DevOps gotchas:

### 1. The `node_modules` Symlink Trap
* **Error:** During the Docker build, the `npm run build` step failed, complaining that it couldn't find `tsc` (TypeScript compiler).
* **Fix:** I use `pnpm` on my local Mac, which heavily relies on symlinks inside `node_modules`. My Dockerfile had a `COPY . .` command that was copying my Mac's broken symlinks into the container, completely overwriting the good `node_modules` that the container had just installed. Adding a `.dockerignore` file containing `node_modules` solved this instantly.

### 2. Prisma vs. Alpine Linux (OpenSSL)
* **Error:** The backend container kept crashing on startup with the error: `Prisma cannot find the required libssl system library`.
* **Fix:** Prisma 4 relies on C++ engine binaries that specifically look for `glibc` and `OpenSSL 1.1`. The default `node:18-alpine` image uses `musl` libc, and the standard `node:18-slim` image (based on Debian 12) uses OpenSSL 3. I switched both Dockerfiles to use `node:18-bullseye-slim` (Debian 11), which has OpenSSL 1.1 built-in natively.

### 3. The 502 Bad Gateway
* **Error:** After getting `docker-compose up` working, visiting the frontend threw a `502 Bad Gateway` error in the browser console.
* **Fix:** I checked the backend logs (`docker-compose logs backend`) and saw that the Express server was crashing because `The table public.Todo does not exist`. Because Docker Compose created a brand new Postgres container, the database was totally empty. I fixed it by running `prisma migrate deploy` inside the running backend container to generate the tables.
