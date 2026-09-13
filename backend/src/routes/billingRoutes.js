import { Router } from "express";
import { initializePayment, verifyPayment } from "../controllers/billingController.js";
import { protect } from "../middleware/auth.js";
const router = Router();
router.post("/initialize", protect, initializePayment);
router.get("/verify/:reference", protect, verifyPayment);
export default router;
