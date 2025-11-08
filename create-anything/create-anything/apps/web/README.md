# Web Application Setup

This document provides the steps to set up and run the web application locally.

## Prerequisites

- [Bun](https://bun.sh/)
- [PostgreSQL](https://www.postgresql.org/)

## 1. Install PostgreSQL

Install PostgreSQL on your system. The installation process varies depending on your operating system.

### macOS (using Homebrew)

```bash
brew install postgresql
brew services start postgresql
```

### Windows

Download and run the installer from the [official PostgreSQL website](https://www.postgresql.org/download/windows/).

### Linux (using apt on Ubuntu)

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

## 2. Create a Database

Once PostgreSQL is installed, you need to create a database and a user.

1.  Open the PostgreSQL interactive terminal:

    ```bash
    psql
    ```

2.  Create a new database:

    ```sql
    CREATE DATABASE create_anything;
    ```

3.  Create a new user and grant privileges to the database. Replace `your_username` and `your_password` with your desired credentials:

    ```sql
    CREATE USER your_username WITH PASSWORD 'your_password';
    GRANT ALL PRIVILEGES ON DATABASE create_anything TO your_username;
    ```

4.  Quit the `psql` shell:

    ```
    \q
    ```

## 3. Create Database Tables

Use the `schema.sql` file to create the necessary tables in your database.

```bash
psql -d create_anything -f ../../../../../schema.sql
```

**Note:** Make sure you are in the `create-anything/create-anything/apps/web` directory when running this command.

## 4. Install Dependencies

Navigate to the `web` app's directory and install the dependencies using `bun`:

```bash
cd create-anything/create-anything/apps/web
bun install
```

## 5. Run the Application

Run the application with the `DATABASE_URL` environment variable. Replace `your_username` and `your_password` with the credentials you created in step 2.

```bash
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/create_anything" bun run dev
```

The application should now be running on your local machine.
