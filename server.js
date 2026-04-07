require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const { sequelize } = require("./models/TaskModel");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "web322_session",
    secret: process.env.SESSION_SECRET || "seneca_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 30 * 60 * 1000,
      secure: false 
    },
  })
);

mongoose
  .connect(process.env.MONGODB_URI, {
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

sequelize
  .sync()
  .then(() => console.log("PostgreSQL synced"))
  .catch((err) => console.error("PostgreSQL error:", err));

app.use("/", authRoutes);
app.use("/tasks", taskRoutes);

app.get("/", (req, res) => res.redirect("/login"));

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
