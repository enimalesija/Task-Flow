# TaskFlow

**TaskFlow** is a modern full-stack task management app built for simplicity, speed, and productivity.
It provides a clean dashboard where users can log in, create, update, and track tasks with persistent backend storage.

🚀 **Live Demo:** [TaskFlow on Vercel](https://task-flow-lac-omega.vercel.app/login)

---

## ✨ Features

* 🔐 **User Authentication** – secure login & session handling
* 📋 **Task Management (CRUD)** – create, edit, delete, and mark tasks as complete
* 🗂️ Kanban Board – three columns (To Do / In Progress / Done) with drag‑and‑drop via @hello-pangea/dnd
* 🧭 Filtering & Sorting – search, tag filter, assignee filter, priority filter; sort by updated/created/due/priority
* 🌓 **Dark/Light Mode** – smooth theme toggle for accessibility
* 📱 **Responsive UI** – works seamlessly across desktop & mobile
* ⚡ **Express.js API** – robust backend with RESTful endpoints
* 💾 **Persistent Database** – tasks stored in Railway-hosted DB
* 🛠️ **Scalable Architecture** – clean separation of frontend & backend

---

## 🖥️ Tech Stack

**Frontend**

* React + TypeScript
* CSS (custom dashboard styling)
* Next.js (deployed on Vercel)

**Backend**

* Node.js + **Express.js**
* REST API endpoints
* MongoDB
* Railway-hosted MongoDB

**Other Tools**

* Git + GitHub for version control
* Vercel & Railway for deployment

---

## ⚙️ Installation & Setup

Clone the repository:

```bash
git clone [https://github.com/enimalesija/Task-Flow]
cd taskflow
```

Install dependencies:

```bash
npm install
```

Set up environment variables:

```bash
cp .env.example .env
# fill in your DB_URL, API keys, etc.
```

Run locally both frontend and backend:

```bash
npm run dev
```

The app should now be running on `http://localhost:3000` 🎉

---

## 📚 API Endpoints

* `GET /tasks` – fetch all tasks
* `POST /tasks` – create a new task
* `PUT /tasks/:id` – update a task
* `DELETE /tasks/:id` – delete a task

---

## ✅ Roadmap

* [ ] Drag-and-drop task ordering
* [ ] Push notifications & reminders
* [ ] Team collaboration features
* [ ] Calendar integration

---

## 👨‍💻 Author

Built with ❤️ by Arben Malesija
