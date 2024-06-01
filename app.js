import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import course from "./Routes/courseRoutes.js";
import user from "./Routes/userRoutes.js";
import other from "./Routes/otherRoutes.js";
import payment from "./Routes/paymentRoutes.js";
import { ErrorMiddleware } from "./Middlewares/error.js";
import cors from "cors";
dotenv.config({
  path: "./Config/config.env",
});
const app = express();

// Using middlewares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1", payment);
app.use("/api/v1", other);

export default app;
app.get("/", (req, res) => {
  res.send(
    `<h1>Server is working. Frontend on ${process.env.FRONTEND_URL}</h1>`
  );
});
app.use(ErrorMiddleware);
