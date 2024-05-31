import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { User } from "../Models/User.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import { instance } from "../server.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Payment } from "../Models/Payment.js";
export const buySubscription = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (user.role === "admin")
    return next(new ErrorHandler("Admin can not buy subscription", 404));
  var instance1 = new Razorpay({
    key_id: "YOUR_KEY_ID",
    key_secret: "YOUR_SECRET",
  });

  const planId = process.env.PLAN_ID || "plan_7wAosPWtrkhqZw";
  const subscription = await instance.subscriptions.create({
    plan_id: planId,
    customer_notify: 1,

    total_count: 12,
  });
  user.subscription.id = subscription.id;
  user.subscription.status = subscription.status;

  await user.save();

  res.status(201).json({
    success: true,
    message: "Subscription created successfully",
    subscriptionId: subscription.id,
  });
});

export const paymentVerification = catchAsyncError(async (req, res, next) => {
  const { razorpay_signature, razorpay_payment_id, razorpay_subscription_id } =
    req.body;

  const user = await User.findById(req.user._id);
  const subscription_id = user.subscription.id;
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
    .digest("hex");
  const isAuthentic = generatedSignature === razorpay_signature;
  if (!isAuthentic)
    return res.redirect(`${process.env.FRONTEND_URL}/paymentFailed`);
  //database comes here
  await Payment.create(
    razorpay_signature,
    razorpay_payment_id,
    razorpay_subscription_id
  );
  user.subscription.status = "active";
  await user.save();
  res.redirect(
    `${process.env.FRONTEND_URL}/paymentSuccess?reference=${razorpay_payment_id}`
  );
});

export const getRazorpayKey = catchAsyncError(async (req, res, next) => {
  res.status(200).json({ success: true, key: process.env.RAZORPAY_API_KEY });
});

export const cancelSubscription = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const subscriptionId = user.subscription.id;
  let refund = false;
  await instance.subscription.cancel(subscriptionId);
  const payment = await Payment.findOne({
    razorpay_subscription_id: subscriptionId,
  });
  const gap = Date.now() - payment.createdAt;
  const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;
  if (refundTime > gap) {
    await instance.payments.refund(payment.razorpay_payment_id);
    refund = true;
  }
  await payment.remove();
  user.subscription.id = undefined;
  user.subscription.status = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: refund
      ? "Subscription Cancelled, You will recieve full refund within 7 buisness days "
      : "Subscription Cancelled,No refund initiated as cancellation was done after 7days ",
  });
});
