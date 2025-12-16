const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const apiRoute = require("./router/api");
const connectDB = require("./config/db");

connectDB();

app.get("/api/health", (req, res) => {
  res.status(200).send("OK");
});
app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use("/api", apiRoute);

// Error handler middleware for multer and other errors
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ message: "File too large. Max 5MB per file." });
  }
  return res.status(500).json({ message: "Internal server error" });
});

let port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
