import express from "express";
import {
  addLectures,
  createCourse,
  deleteCourse,
  deleteLecture,
  getAllCourses,
  getCourseLectures,
} from "../Controllers/courseController.js";
import singleUpload from "../Middlewares/multer.js";
import {
  authorizeAdmin,
  isAuthenticated,
  authorizeSubscriber,
} from "../Middlewares/auth.js";
const router = express.Router();

router.route("/courses").get(getAllCourses);
router
  .route("/createCourse")
  .post(isAuthenticated, singleUpload, authorizeAdmin, createCourse);

//add lecture delete course get course details
router
  .route("/course/:id")
  .get(isAuthenticated, authorizeSubscriber, getCourseLectures)
  .post(isAuthenticated, authorizeAdmin, singleUpload, addLectures)
  .delete(isAuthenticated, authorizeAdmin, deleteCourse);
//delete lecture
router
  .route("/lecture/:id")
  .delete(isAuthenticated, authorizeAdmin, deleteLecture);
export default router;
