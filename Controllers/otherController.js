import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import ErrorHandler from "../Utils/ErrorHandler.js";
import { sendEmail } from "../Utils/SendEmail.js";
import { Stats } from "../Models/Stats.js";

export const contact = catchAsyncError(async (req, res, next) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return next(new ErrorHandler("Please enter all fields", 400));
  const to = process.env.MY_MAIL;
  const subject = `Contact from videostreamer`;
  const text = `I am ${name} and my message is ${message}`;

  await sendEmail(to, subject, text);
  res
    .status(200)
    .json({ success: true, message: "Your message has been sent" });
});

export const courseRequest = catchAsyncError(async (req, res, next) => {
  const { name, email, course } = req.body;
  if (!name || !email || !course)
    return next(new ErrorHandler("Please enter all fields", 400));
  const to = process.env.MY_MAIL;
  const subject = `Request for course on vidrostreamer`;
  const text = `I am ${name} and my request is a course on ${course}`;

  await sendEmail(to, subject, text);
  res
    .status(200)
    .json({ success: true, message: "Your request has been sent" });
});

export const getDashboardStats = catchAsyncError(async (req, res, next) => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(12);
  const statsData = [];
  for (let i = 0; i < stats.length; i++) {
    statsData.unshift(stats[i]);
  }
  const requiredSize = 12 - stats.length;
  for (let i = 0; i < requiredSize; i++) {
    statsData.unshift({
      users: 0,
      subscriptions: 0,
      views: 0,
    });
  }
  const usersCount = statsData[11].users;
  const viewsCount = statsData[11].views;
  const subscriptionsCount = statsData[11].subscriptions;
  let usersPercentage = 0,
    viewsPercentage = 0,
    subscriptionsPercentage = 0;
  let usersProfit = true,
    viewsProfit = true,
    subscriptionsProfit = true;
  if (statsData[10].users === 0) usersPercentage = usersCount * 100;
  if (statsData[10].views === 0) viewsPercentage = viewsCount * 100;
  if (statsData[10].subscriptions === 0)
    subscriptionsPercentage = subscriptionsCount * 100;
  else {
    const difference = {
      users: statsData[11].users - statsData[10].users,
      views: statsData[11].views - statsData[10].views,
      subscriptions: statsData[11].subscriptions - statsData[10].subscriptions,
    };
    usersPercentage = (difference.users / statsData[10].users) * 100;
    viewsPercentage = (difference.views / statsData[10].views) * 100;
    subscriptionsPercentage =
      (difference.subscriptions / statsData[10].subscriptions) * 100;

    if (usersPercentage < 0) usersProfit = false;
    if (viewsPercentage < 0) viewsProfit = false;
    if (subscriptionsPercentage < 0) subscriptionsProfit = false;
  }
  res.status(200).json({
    success: true,
    stats: statsData,
    usersCount,
    viewsCount,
    subscriptionsCount,
    usersPercentage,
    viewsPercentage,
    subscriptionsPercentage,
    viewsProfit,
    subscriptionsProfit,
    usersProfit,
  });
});
// export const courseRequest = catchAsyncError(async (req, res, next) => {
//   res.status(200).json({ success: true });
// });
