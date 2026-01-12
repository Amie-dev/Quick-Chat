import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import connectDB from "./utils/db.utils.js";
import authRouter from "./router/auth.router.js";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", (_, res) => {
  res.send(`<h1>Hello From Server</h1>`);
});

// Routers
app.use("/api/auth", authRouter);

// ✅ Universal error handler (must be last)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Internal Server Error" });
});

try {
  const port = process.env.PORT || 5000;
  await connectDB();
  httpServer.listen(port, () =>
    console.log(`Server listening at port ${port}`)
  );
} catch (error) {
  console.error("Server error during start", error);
  process.exit(1);
}
