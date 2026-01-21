import jwt from "jsonwebtoken";
import cookie from "cookie";
import User from "../models/user.model.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    // Extract cookies from the socket handshake headers
    const cookies = socket.handshake.headers.cookie;

    // If no cookies are present, block the connection
    if (!cookies) {
      return next(new Error("No cookies found"));
    }

    // Parse cookies into an object
    const parsed = cookie.parse(cookies);
    const token = parsed.token;

    // If no token is provided, block the connection
    if (!token) {
      return next(new Error("No token provided"));
    }

    // Verify the JWT using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database, excluding the password field
    const user = await User.findById(decoded._id).select("-password");

    // If no user is found, block the connection
    if (!user) {
      return next(new Error("Invalid token"));
    }

    // Attach user details to the socket for later use
    socket.userId = user._id.toString();
    socket.user = user;

    // Allow the connection to proceed
    next();

  } catch (error) {
    // Log the error for debugging
    console.error("Socket auth error:", error);

    // Block the connection with a generic error
    next(new Error("Authentication failed"));
  }
};
