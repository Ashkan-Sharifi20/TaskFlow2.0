const express = require("express");
const router = express.Router();
const { Task } = require("../models/TaskModel");
const requireLogin = require("../middleware/requireLogin");

// Apply login protection to ALL routes in this file
router.use(requireLogin);

/**
 * GET /tasks/dashboard
 * Calculates stats for the logged-in user
 */
router.get("/dashboard", async (req, res) => {
  try {
    const tasks = await Task.findAll({ 
      where: { userId: req.session.user.id } 
    });

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = total - completed;

    res.render("dashboard", { 
      user: req.session.user, 
      total, 
      completed, 
      pending 
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.render("dashboard", { 
      user: req.session.user, 
      total: 0, 
      completed: 0, 
      pending: 0 
    });
  }
});

/**
 * GET /tasks/
 * Displays the full task list
 */
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.findAll({ 
      where: { userId: req.session.user.id }, 
      order: [["createdAt", "DESC"]] 
    });
    res.render("tasks", { user: req.session.user, tasks });
  } catch (err) {
    res.render("tasks", { user: req.session.user, tasks: [] });
  }
});

/**
 * GET /tasks/add
 */
router.get("/add", (req, res) => {
  res.render("add", { user: req.session.user, error: null });
});

/**
 * POST /tasks/add
 */
router.post("/add", async (req, res) => {
  const { title, description, dueDate } = req.body;
  if (!title) {
    return res.render("add", { user: req.session.user, error: "Title is required." });
  }
  try {
    await Task.create({ 
      title, 
      description: description || null, 
      dueDate: dueDate || null, 
      status: "pending", 
      userId: req.session.user.id 
    });
    res.redirect("/tasks");
  } catch (err) {
    res.render("add", { user: req.session.user, error: "Failed to create task." });
  }
});

/**
 * GET /tasks/edit/:id
 */
router.get("/edit/:id", async (req, res) => {
  try {
    const task = await Task.findOne({ 
      where: { id: req.params.id, userId: req.session.user.id } 
    });
    if (!task) return res.redirect("/tasks");
    res.render("edit", { user: req.session.user, task, error: null });
  } catch (err) {
    res.redirect("/tasks/dashboard");
  }
});

/**
 * POST /tasks/edit/:id
 */
router.post("/edit/:id", async (req, res) => {
  const { title, description, dueDate, status } = req.body;
  try {
    const task = await Task.findOne({ 
      where: { id: req.params.id, userId: req.session.user.id } 
    });
    
    if (!task) return res.redirect("/tasks");
    if (!title) {
      return res.render("edit", { user: req.session.user, task, error: "Title is required." });
    }

    await task.update({ 
      title, 
      description: description || null, 
      dueDate: dueDate || null, 
      status 
    });
    
    res.redirect("/tasks");
  } catch (err) {
    res.redirect("/tasks");
  }
});

/**
 * POST /tasks/delete/:id
 */
router.post("/delete/:id", async (req, res) => {
  try {
    await Task.destroy({ 
      where: { id: req.params.id, userId: req.session.user.id } 
    });
  } catch (err) {
    console.error(err);
  }
  res.redirect("/tasks");
});

/**
 * POST /tasks/status/:id (For quick toggles/selects)
 */
router.post("/status/:id", async (req, res) => {
  const { status } = req.body;
  try {
    await Task.update(
      { status }, 
      { where: { id: req.params.id, userId: req.session.user.id } }
    );
  } catch (err) {
    console.error(err);
  }
  res.redirect("/tasks");
});

module.exports = router;