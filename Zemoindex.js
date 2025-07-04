const express = require("express");
// cors
const cors = require("cors");
require("dotenv").config();
// define app to call express module
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const PORT = process.env.PORT || 8080;
const MONGOURL = process.env.MONGOURL;
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

// CRATE MongoDb connection
mongoose.connect(MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// creation of schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
// CRATE new user model
const User = mongoose.model("User", userSchema);

// task schema
const taskShema = new mongoose.Schema({
  text: String,
  status: String,
  priority: String,
  userId: mongoose.Schema.Types.ObjectId,
});
// CRATE new task model
const Task = mongoose.model("Task", taskShema);

// post request
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  // encrpt password
  const hashed = await bcrypt(password, 10);
  // add this user to table
  const user = new User({ username, password: hashed });
  await user.save();
  rej.json({ message: "User has been registered" });
});
// login page
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  One({ username });
  if (!user || !(await bcrypt.compare(password, user.pass))) {
    return res.status(401).json({ message: "Invalid Credential" });
  }
  const token = jwt.sign({ userId: User._id }, "secret", { expiresIn: "1h" });
  res.json({ token });
});

// authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header("authorizationtion")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decode = jwt.verify(token, "secret");
    req.userId = decode.userId;
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

// get
//   route "/task"
// get task request
app.get("/tasks", authMiddleware, async (req, res) => {
  const tasks = await Task.find({ userId: req.userId });
  res.json(tasks);
});
//post on "/task"
// post task request
app.post("/tasks", authMiddleware, async (req, res) => {
  const task = new Task({ ...req.body, userId: req.userId });
  await task.save();
  res.json(task);
});
// delete task request
app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id.userId });
  req.json({ message: "Task Deleted" });
});

//Update status of task
app.patch("tasks/id/:status", authMiddleware, async (req, res) => {
  const { status } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { status },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

//Update priority of task
app.patch("tasks/id/:priority", authMiddleware, async (req, res) => {
  const { priority } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { priority },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

// server
app.listen(PORT, () => console.log("Server is running on port:8080"));
