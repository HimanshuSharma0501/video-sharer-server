import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import course from "./Routes/courseRoutes.js";
import user from "./Routes/userRoutes.js";
import other from "./Routes/otherRoutes.js";
import payment from "./Routes/paymentRoutes.js";
import { ErrorMiddleware } from "./Middlewares/error.js";
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

app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1", payment);
app.use("/api/v1", other);

export default app;
app.use(ErrorMiddleware);
