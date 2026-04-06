/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Ashkan Sharifi      Student ID: 178960233   Date: Apr 5th, 2026
*
********************************************************************************/

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const { sequelize } = require("./models/TaskModel");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "web322_session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 },
  })
);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

sequelize
  .sync()
  .then(() => console.log("PostgreSQL synced"))
  .catch((err) => console.error("PostgreSQL error:", err));

app.use("/", authRoutes);
app.use("/tasks", taskRoutes);

app.get("/", (req, res) => res.redirect("/login"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));