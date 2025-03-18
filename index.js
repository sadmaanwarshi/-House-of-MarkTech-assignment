import express from "express";
import { config } from "dotenv";
import pg from "pg";
import auth from "./routes/auth.js";
import register from "./routes/register.js";
import isAuthenticated from "./middleware/isAuthenticate.js";

config(); // Load environment variables

const app = express();
app.use(express.json());

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// 📌 Priority Queue Implementation
class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  insert(task) {
    this.heap.push(task);
    this.heap.sort((a, b) =>
      a.priority === b.priority
        ? new Date(a.created_at) - new Date(b.created_at)
        : { high: 1, medium: 2, low: 3 }[a.priority] -
          { high: 1, medium: 2, low: 3 }[b.priority]
    );
  }

  removeCompleted(taskId) {
    this.heap = this.heap.filter((task) => task.id !== parseInt(taskId));
  }

  peek() {
    return this.heap.length ? this.heap[0] : null;
  }

  isEmpty() {
    return this.heap.length === 0;
  }
}

const taskQueue = new PriorityQueue();

// Load pending tasks into queue at startup
const loadTasks = async () => {
  const { rows } = await pool.query(
    `SELECT * FROM tasks WHERE status = 'pending' ORDER BY 
    CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, created_at ASC`
  );
  rows.forEach((task) => taskQueue.insert(task));
};
loadTasks();

app.use("/auth", auth);
app.use("/auth",register);

// Create a new task
app.post("/tasks", isAuthenticated, async (req, res) => {
  const { title, description, priority } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO tasks (title, description, priority) VALUES ($1, $2, $3) RETURNING *",
      [title, description, priority]
    );
    taskQueue.insert(rows[0]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Get all tasks (sorted by priority & time)
app.get("/tasks", isAuthenticated, async (_, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM tasks ORDER BY 
    CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, created_at ASC`
  );
  res.json(rows);
});

// Get next pending task
app.get("/tasks/next", isAuthenticated, (_, res) => {
  if (taskQueue.isEmpty()) return res.json({ message: "No pending tasks" });
  res.json(taskQueue.peek());
});

// Update task status & fetch next pending task
app.put("/tasks/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const { rows } = await pool.query(
      "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Task not found" });

    // Remove completed task from queue
    if (status === "completed") {
      taskQueue.removeCompleted(id);
    }

    // Return next pending task
    res.json({
      message: `Task ${id} marked as ${status}`,
      next_task: taskQueue.peek() || "No more pending tasks",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Delete a task
app.delete("/tasks/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    taskQueue.removeCompleted(id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
