import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    // 1. Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No authorization token provided",
      });
    }

    // 2. Get token from "Bearer TOKEN"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // 4. Store decoded information in request
    req.user = decoded;

    // 5. Continue to next middleware/controller
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};