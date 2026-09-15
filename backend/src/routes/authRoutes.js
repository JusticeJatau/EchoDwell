import { Router } from "express";
import {
  adminLogin,
  login,
  logout,
  me,
  register,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.post("/logout", logout);
router.get("/me", protect, me);
export default router;
