// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
  let token;

  // Header дотор Authorization байгаа эсэхийг шалгах
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // "Bearer TOKEN" → TOKEN хэсгийг салгах
      token = req.headers.authorization.split(" ")[1];

      // Токеныг шалгах
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Токеноос хэрэглэгчийн ID-г гаргаж, req.user-д дамжуулах
      req.user = await User.findById(decoded.id).select("-password");

      next(); // дараагийн middleware рүү шилжих
    } catch (error) {
      console.error("Token error:", error);
      res.status(401).json({ message: "Token буруу эсвэл хугацаа дууссан" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Token байхгүй байна" });
  }
};