import express from "express";
import { isAuthenticated } from "../Middlewares/auth.js";
import {
  buySubscription,
  cancelSubscription,
  getRazorpayKey,
  paymentVerification,
} from "../Controllers/paymentController.js";

const router = express.Router();

router.route("/subscribe").get(isAuthenticated, buySubscription);
//VERIFY PAYMENT AND SAVE REF. IN DATABASE
router.route("/paymentVerification").post(isAuthenticated, paymentVerification);
router.route("/razorpayKey").get(getRazorpayKey);
router.route("/subscribe/cancel").delete(isAuthenticated, cancelSubscription);

export default router;
