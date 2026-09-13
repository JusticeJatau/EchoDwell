import "dotenv/config";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) throw new Error("Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD (minimum 8 characters) in backend/.env");
await connectDB();
const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
if (existing) { existing.name = ADMIN_NAME; existing.role = "platform_admin"; existing.password = ADMIN_PASSWORD; await existing.save(); console.log(`Updated platform admin: ${ADMIN_EMAIL}`); }
else { await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "platform_admin", verificationStatus: "approved" }); console.log(`Created platform admin: ${ADMIN_EMAIL}`); }
process.exit(0);
