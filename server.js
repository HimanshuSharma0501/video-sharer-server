import app from "./app.js";
import cloudinary from "cloudinary";
import Razorpay from "razorpay";
import nodeCron from "node-cron";
import { Stats } from "./Models/Stats.js";
//connecting to database
import { connectToDB } from "./Config/database.js";
connectToDB();
//cloudinary

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

//razorpay
export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

//nodecron
nodeCron.schedule("0 0 0 1 * *", async () => {
  try {
    await Stats.create({});
  } catch (error) {
    console.log(error);
  }
});

//connecting to server
app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});
