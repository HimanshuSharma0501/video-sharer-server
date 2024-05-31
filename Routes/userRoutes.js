import express from "express";
import {
  registerUser,
  login,
  logout,
  getMyProfile,
  changePassword,
  updateProfile,
  updateProfilePicture,
  forgetPassword,
  resetPassword,
  addToPlaylist,
  removeFromPlaylist,
  getAllUsers,
  updateUserRole,
  deleteUserProfile,
  deleteMyProfile,
} from "../Controllers/userController.js";
import { authorizeAdmin, isAuthenticated } from "../Middlewares/auth.js";
import singleUpload from "../Middlewares/multer.js";
const router = express.Router();

router.route("/register").post(singleUpload, registerUser);
//login
router.route("/login").post(login);
//logout
router.route("/logout").get(logout);
//getmyprofile
router.route("/me").get(isAuthenticated, getMyProfile);
//changepassword
router.route("/changePassword").put(isAuthenticated, changePassword);
//updateprofile
router.route("/updateProfile").put(isAuthenticated, updateProfile);
//updateprofilepicture
router
  .route("/updateProfilePicture")
  .put(isAuthenticated, singleUpload, updateProfilePicture);
//forget pass
router.route("/forgetPassword").post(forgetPassword);
//rest password
router.route("/resetPassword/:token").put(resetPassword);
//add to playlist
router.route("/addToPlaylist").post(isAuthenticated, addToPlaylist);
//remove from playlist
router.route("/removeFromPlaylist").delete(isAuthenticated, removeFromPlaylist);
//delete my profile
router.route("/deleteMyProfile").delete(isAuthenticated, deleteMyProfile);

//ADMIN ONLY
//admin routes
router.route("/admin/users").get(isAuthenticated, authorizeAdmin, getAllUsers);
router
  .route("/admin/userRoleUpdate/:id")
  .put(isAuthenticated, authorizeAdmin, updateUserRole)
  .delete(isAuthenticated, authorizeAdmin, deleteUserProfile);

export default router;
