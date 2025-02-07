import express from "express";
import cors from "cors";
import morgan from "morgan";

import { loadConfigs } from "./v1/middlewares/config.middleware.js";
import APIv1 from "./v1/routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await loadConfigs();

// Basic routes
app.use("/api/v1", APIv1);

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    msg: "Health Checked!",
    data: {},
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.log("\\n An error occurred: m");
  console.error(err);

  res.status(500).json({
    status: "failed",
    msg: err.message,
    data: err.data,
  });
});

export default app;
