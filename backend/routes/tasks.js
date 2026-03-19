const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");

const router = express.Router();

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Create task
router.post("/", async (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  const task = await Task.create({ title, status: "pending" });
  return res.status(201).json(task);
});

// List all tasks
router.get("/", async (_req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  return res.json(tasks);
});

// Get a single task
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid id" });

  const task = await Task.findById(id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  return res.json(task);
});

// Update (supports mark complete)
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid id" });

  const update = {};

  if (typeof req.body?.title === "string") {
    const title = req.body.title.trim();
    if (!title) return res.status(400).json({ error: "Task title is required" });
    update.title = title;
  }

  if (typeof req.body?.status === "string") {
    const status = req.body.status;
    if (!["pending", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    update.status = status;
  }

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const task = await Task.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
  if (!task) return res.status(404).json({ error: "Task not found" });
  return res.json(task);
});

// Delete task
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid id" });

  const task = await Task.findByIdAndDelete(id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  return res.status(204).send();
});

module.exports = router;

