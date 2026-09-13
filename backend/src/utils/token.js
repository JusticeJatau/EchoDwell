import jwt from "jsonwebtoken";

export const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

export function sendAuth(res, user, statusCode = 200) {
  const token = createToken(user._id);
  res.cookie("echodwell_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(statusCode).json({ user: user.toSafeObject(), token });
}
