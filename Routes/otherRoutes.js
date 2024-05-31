import express from "express";
import { authorizeAdmin, isAuthenticated } from "../Middlewares/auth.js";
import {
  contact,
  courseRequest,
  getDashboardStats,
} from "../Controllers/otherController.js";

const router = express.Router();

//contact form
router.route("/contact").post(contact);
router.route("/courseRequest").post(courseRequest);

//admin
router
  .route("/admin/stats")
  .get(isAuthenticated, authorizeAdmin, getDashboardStats);

export default router;
