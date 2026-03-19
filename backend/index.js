const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./db");
const taskRoutes = require("./routes/tasks");

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/tasks", taskRoutes);

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exitCode = 1;
});
