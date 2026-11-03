# Luxe Screens: Windows Setup Guide

This guide takes a **Windows 10 / 11** laptop from nothing installed to the website running locally, step by step. No prior experience with this project is needed.

**Time needed:** about 20–30 minutes (most of it is installing software).

---

## Contents

1. [What you will set up](#1-what-you-will-set-up)
2. [Install the required software](#2-install-the-required-software)
3. [Open a terminal](#3-open-a-terminal)
4. [Download the project](#4-download-the-project)
5. [Install the project's packages](#5-install-the-projects-packages)
6. [Create the database](#6-create-the-database) (choose **Option A** or **Option B**)
7. [Create the settings file (server\.env)](#7-create-the-settings-file-serverenv)
8. [Create the tables and load sample data](#8-create-the-tables-and-load-sample-data)
9. [Run the website](#9-run-the-website)
10. [Check everything works](#10-check-everything-works)
11. [Everyday commands](#11-everyday-commands)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. What you will set up

The project has two independent Node.js apps in one repository:

| Folder    | What it is                                                  | Runs at                     |
| --------- | ----------------------------------------------------------- | --------------------------- |
| `client\` | The website: **React 19** + Vite, with its own dependencies | <http://localhost:5173>     |
| `server\` | The API: **Node.js + Express**, with its own dependencies   | <http://localhost:4000/api> |

Pricing, date, validation and planner helpers are included inside both apps, so each can be installed and deployed independently.

You will install:

| Software       | Why                                                            |
| -------------- | -------------------------------------------------------------- |
| **Node.js**    | Runs the website and the API                                   |
| **Git**        | Downloads the code from GitHub                                 |
| **PostgreSQL** | The database that stores theatres, bookings, coupons and so on |

You only need **one** way of running PostgreSQL:

- **Option A: PostgreSQL installed on Windows.** Recommended. Simple, and it comes with pgAdmin, a visual tool.
- **Option B: Docker Desktop.** One command starts a ready-made database, but Docker itself is a bigger install.

---

## 2. Install the required software

### 2.1 Node.js (required)

1. Go to <https://nodejs.org> and download the **LTS** version for Windows (`.msi`, **v20.19 or newer**; v22 recommended).
2. Run the installer and keep the default options.
3. **Restart VS Code / any open terminals** so they pick up Node.js.

### 2.2 Git (required)

1. Download **Git for Windows** from <https://git-scm.com/download/win>.
2. Run the installer and keep the default options.

### 2.3 VS Code (recommended)

Download from <https://code.visualstudio.com>. It has a built-in terminal, which is the easiest way to run the commands below.

### 2.4 A database: pick ONE

- **Option A (recommended):** PostgreSQL. Full install steps are in [section 6, Option A](#option-a-postgresql-installed-on-windows).
- **Option B:** Docker Desktop from <https://www.docker.com/products/docker-desktop>. During install, keep **"Use WSL 2"** ticked. Restart Windows if asked.

---

## 3. Open a terminal

All commands in this guide are for **PowerShell**, the default Windows terminal.

- **In VS Code:** menu **Terminal → New Terminal**.
- **Or:** press `Win`, type **PowerShell**, and open **Windows PowerShell**.

Check the software is installed (run each line):

```powershell
node --version    # should print v20.19.x or higher
npm --version
git --version
```

> **If `npm` shows "running scripts is disabled on this system"**, run this once, type `Y` and press Enter:
>
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
> ```
>
> Then close and reopen the terminal.

---

## 4. Download the project

Pick a simple folder **outside OneDrive** (OneDrive syncing can lock files and slow things down). For example, `C:\Projects`:

```powershell
mkdir C:\Projects
cd C:\Projects
git clone https://github.com/Anand1-18/Luxe_Screen.git
cd Luxe_Screen
```

The repository is **private**, so the owner must first add your GitHub account as a collaborator (**Settings → Collaborators → Add people**) and you must accept the email invite. When you clone, Git opens a browser window asking you to sign in to GitHub.

> Every command from now on must be run **inside the `Luxe_Screen` folder**. Your terminal prompt should end with `\Luxe_Screen>`.
>
> In VS Code you can also do **File → Open Folder → `C:\Projects\Luxe_Screen`**, then open a new terminal; it starts in the right folder.

---

## 5. Install the project's packages

```powershell
Push-Location server
npm install
Pop-Location

Push-Location client
npm install
Pop-Location
```

Each app gets its own `node_modules` and `package-lock.json`. The server install also prepares Prisma automatically (`✔ Generated Prisma Client`). Warnings in yellow are normal; red **errors** are not (see [Troubleshooting](#12-troubleshooting)).

---

## 6. Create the database

### Option A: PostgreSQL installed on Windows

#### A1. Install PostgreSQL

1. Go to <https://www.postgresql.org/download/windows/> and click **Download the installer** (EDB). Choose **version 17** (14 or newer works) for **Windows x86-64**.
2. Run the installer and click **Next** through the screens, keeping the defaults, except:
   - **Select Components:** keep **PostgreSQL Server**, **pgAdmin 4** and **Command Line Tools** ticked. _Stack Builder_ is not needed.
   - **Password:** type a password for the `postgres` superuser and **write it down**. You will need it in step 7.
   - **Port:** keep `5432`.
   - **Locale:** keep _Default locale_.
3. Click **Finish**. If Stack Builder opens, you can close it.

PostgreSQL now runs automatically in the background as a Windows service, even after a restart.

#### A2. Create the database: way 1, pgAdmin (visual)

1. Press `Win`, type **pgAdmin 4** and open it. (The first launch can take a minute.)
2. In the left panel, click **Servers → PostgreSQL 17**. Enter the password you set during install, and tick _Save password_ if you like.
3. Right-click **Databases → Create → Database…**
4. In the **Database** field, type exactly: `luxe_screens`
5. Click **Save**.

✅ You should now see `luxe_screens` under **Databases**.

#### A2. Create the database: way 2, SQL Shell (command line)

1. Press `Win`, type **SQL Shell (psql)** and open it.
2. Press **Enter** four times to accept the defaults for _Server_, _Database_, _Port_ and _Username_.
3. Type your PostgreSQL **password** and press Enter. Nothing is shown while you type; that's normal.
4. At the `postgres=#` prompt, type:

   ```sql
   CREATE DATABASE luxe_screens;
   ```

   You should see `CREATE DATABASE`.

5. Type `\q` and press Enter to exit.

> **Prefer PowerShell?** This does the same in one line (it asks for your password):
>
> ```powershell
> & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -c "CREATE DATABASE luxe_screens;"
> ```
>
> If you installed a different version, change `17` in the path (e.g. `16`).

#### A3. Check the database exists

In pgAdmin, right-click **Databases → Refresh**. `luxe_screens` should be listed. Or in PowerShell:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -c "\l"
```

✅ Done. Go to [step 7](#7-create-the-settings-file-serverenv).

---

### Option B: Docker Desktop

1. Open **Docker Desktop** and wait until the bottom-left shows **Engine running**.
2. In the `Luxe_Screen` folder, run:

   ```powershell
   docker compose up -d
   ```

This starts PostgreSQL 17 in the background with:

| Setting  | Value                                  |
| -------- | -------------------------------------- |
| Host     | `localhost`                            |
| Port     | `5432`                                 |
| Username | `postgres`                             |
| Password | `postgres`                             |
| Database | `luxe_screens` (created automatically) |

Check it's running:

```powershell
docker compose ps     # STATUS should show "running" / "healthy"
```

✅ Done. Go to [step 7](#7-create-the-settings-file-serverenv).

> **Note:** if PostgreSQL is _also_ installed on Windows, both want port 5432 and will clash. Either stop the Windows service (see [Troubleshooting](#12-troubleshooting)) or use Option A only.

---

## 7. Create the settings file (server\.env)

The API needs to know how to connect to your database. In the `Luxe_Screen` folder, copy the example file:

```powershell
Copy-Item server\.env.example server\.env
```

Open it in Notepad (or open `server\.env` from VS Code's file list):

```powershell
notepad server\.env
```

It looks like this:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/luxe_screens?schema=public"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
```

The `DATABASE_URL` format is:

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
```

| Your setup                          | What to change                                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| **Option A (installed PostgreSQL)** | Replace the **second** `postgres` (the password) with **your** PostgreSQL password |
| **Option B (Docker)**               | Nothing. It already matches.                                                       |

**Example:** if your PostgreSQL password is `mypassword`:

```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/luxe_screens?schema=public"
```

Leave `PORT` and `CLIENT_ORIGIN` as they are. Save the file (`Ctrl + S`) and close it.

> **Password has special characters** like `@ # % / :`? Replace them with their URL codes, for example `@` → `%40`, `#` → `%23`, `%` → `%25`. So `my@pass` becomes `my%40pass`.

> `server\.env` contains your password, so it is **never uploaded to GitHub** (git ignores it).

> **Check the file name:** it must be exactly `.env` inside the `server` folder, not `.env.txt`. In File Explorer, turn on **View → Show → File name extensions** to confirm.

> The website (`client`) needs **no** settings file for local development.

---

## 8. Create the tables and load sample data

```powershell
npm run db:deploy
```

✅ Expected: `All migrations have been successfully applied.`

```powershell
npm run db:seed
```

✅ Expected:

```
Seed complete: {
  locations: 5,
  theaters: 6,
  slots: 24,
  addOns: 12,
  addOnOptions: 23,
  coupons: 4
}
```

Your database now has all tables, plus sample theatres, time slots, cakes, decor, gifts and coupons. Running the seed again is safe; it won't create duplicates.

---

## 9. Run the website

Start the API and website in **two separate terminals**, both opened in the project root:

```powershell
# Terminal 1: API
npm run dev:server
```

```powershell
# Terminal 2: website
npm run dev:client
```

`Ctrl + Click` the **http://localhost:5173** link (or type it into Chrome / Edge).

> The website calls the API through `/api`, which Vite forwards to port 4000 automatically. Keep both terminals running.

> If **Windows Defender Firewall** asks about Node.js, click **Allow**. It is only used on your own machine.

To stop each process, click its terminal and press `Ctrl + C`.

---

## 10. Check everything works

| Check          | How                                               | Expected                                                  |
| -------------- | ------------------------------------------------- | --------------------------------------------------------- |
| API + database | Open `http://localhost:4000/api/health`           | `{"status":"ok","database":"up"}`                         |
| Home page      | Open `http://localhost:5173`                      | Slideshow, services, theatres, FAQ                        |
| Gallery        | Click **Theatres**                                | 6 theatres; search and filters work                       |
| AI Planner     | Click **AI Planner**, then **Plan my experience** | A recommended theatre and package                         |
| Booking        | Click **Book Now** and complete all 9 steps       | "Booking confirmed!" with a reference like `LXS-AB12CD34` |
| Waitlist       | Click **New Locations** and submit the form       | "You're on the list!"                                     |

**Test coupons:** `LUXE10`, `FIRSTSHOW`, `CELEBRATE20` (valid) · `MONSOON25` (expired, to see the error).

**Payment is simulated:** no real money and no card details. Tick _"Test mode: simulate a declined payment"_ to try the failure path.

### See the saved data

**Way 1, Prisma Studio** (opens in your browser):

```powershell
npm run db:studio
```

Click a table such as `Booking`, `CartItem`, `WaitlistEntry` or `ContactMessage` to see the rows.

**Way 2, pgAdmin:** **Servers → PostgreSQL 17 → Databases → luxe_screens → Schemas → public → Tables**, then right-click a table → **View/Edit Data → All Rows**.

---

## 11. Everyday commands

After the first setup, you only need:

```powershell
cd C:\Projects\Luxe_Screen
```

(Option B only: open Docker Desktop first, and run `docker compose up -d` if the database isn't running.)

| Command | What it does |
|---|---|
| `npm run dev:server` / `npm run dev:client` | Start the API or website (use separate terminals) |
| `npm test` | Run server and client tests |
| `npm run build` then `npm run preview` | Build and preview the production website |
| `npm run db:studio` | Browse the database in your browser |
| `npm run db:seed` | Reload the sample data |
| `npm run db:reset` | ⚠️ Delete **all** data, recreate tables and reseed |
| `docker compose down` | (Option B) Stop the Docker database; data is kept |
| `docker compose down -v` | (Option B) ⚠️ Stop it **and delete** all its data |

### Getting the latest code later

```powershell
git pull
Push-Location server; npm install; Pop-Location
Push-Location client; npm install; Pop-Location
npm run db:deploy     # applies any new database changes
```

---

## 12. Troubleshooting

| Problem / error message                                                        | Cause                                                               | Fix                                                                                                                                                                     |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node` / `npm` / `git` _is not recognized_                                     | Not installed, or the terminal was open during install              | Install it, then **close and reopen** VS Code / PowerShell                                                                                                              |
| `running scripts is disabled on this system`                                   | PowerShell execution policy                                         | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then reopen the terminal                                                                                     |
| `The datasource.url property is required` / `DATABASE_URL is not set`          | `server\.env` missing, misnamed (`.env.txt`) or in the wrong folder | Redo [step 7](#7-create-the-settings-file-serverenv); the file must be `Luxe_Screen\server\.env`                                                                        |
| `password authentication failed for user "postgres"`                           | Wrong password in `server\.env`                                     | Fix the password in `DATABASE_URL` (see the special-characters note in step 7)                                                                                          |
| `Can't reach database server at localhost:5432`                                | PostgreSQL isn't running                                            | **Option A:** press `Win + R`, type `services.msc`, find **postgresql-x64-17**, right-click → **Start**. **Option B:** open Docker Desktop, then `docker compose up -d` |
| `database "luxe_screens" does not exist`                                       | Database not created                                                | Do [step 6](#6-create-the-database)                                                                                                                                     |
| Website shows **"Something went wrong… check that the API server is running"** | The API isn't running or crashed                                    | Check the API terminal for the error; make sure `npm run dev:server` is running                                                                                           |
| `EADDRINUSE ... :4000`                                                         | Another program uses port 4000                                      | Close it, or find it with `netstat -ano \| findstr :4000` and end that PID in Task Manager                                                                              |
| Website opens on `:5174` instead of `:5173`                                    | Port 5173 was busy                                                  | Nothing to do: use the URL the terminal prints                                                                                                                          |
| `port 5432 is already allocated` (Docker)                                      | Installed PostgreSQL already uses 5432                              | Stop the **postgresql-x64-17** service in `services.msc`, or just use Option A                                                                                          |
| `psql` _is not recognized_                                                     | PostgreSQL's `bin` folder isn't on PATH                             | Use **SQL Shell (psql)** from the Start menu, or the full path `& "C:\Program Files\PostgreSQL\17\bin\psql.exe"`                                                        |
| Pages load but show no theatres                                                | Sample data not loaded                                              | Run `npm run db:seed`                                                                                                                                                   |
| `EPERM` / `EBUSY` / "operation not permitted" during `npm install`             | OneDrive or antivirus is locking files                              | Move the project out of OneDrive (e.g. `C:\Projects`), close other editors, run `npm install` again                                                                     |
| `Filename too long` during `git clone`                                         | Windows path length limit                                           | Run `git config --global core.longpaths true`, then clone again into a short path like `C:\Projects`                                                                    |

Still stuck? Copy the **full error message** from the terminal and send it to the person who shared the project.
