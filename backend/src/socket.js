import RedisService from "./services/RedisService.js";
import { leaveAllRooms } from "./socket/helper.js";
import { notifyConversationOnlineStatus } from "./socket/socketConversation.js";

// Function to initialize socket connections and handle user presence
export const initializeSocket = async (io) => {
  // Listen for new client connections
  io.on("connection", async (socket) => {
    try {
      // Retrieve the authenticated user object attached in socketAuthMiddleware
      const user = socket.user;

      // Log socket ID and user ID for debugging and tracking
      console.log("User connected with socket id:", socket.id);
      console.log("User Connect", user._id);

      // Join a room named after the user's ID
      // This allows sending targeted events directly to this specific user
      socket.join(user._id.toString());

      // Add this socket connection to Redis for tracking active sessions
      await RedisService.addUserSession(user._id, socket.id);

      // Notify all relevant conversations/friends that this user is now online
      await notifyConversationOnlineStatus(io, socket, true);

      // Handle user disconnection
      socket.on("disconnect", async () => {
        // Remove this socket session from Redis
        await RedisService.removeUserSession(user._id, socket.id);

        // Check if the user still has any active sessions
        const isOnline = await RedisService.isUserOnline(user._id);

        if (!isOnline) {
          // If no sessions remain, notify friends that the user is offline
          await notifyConversationOnlineStatus(io, socket, false);

          // Clean up: remove the user from all rooms they joined
          leaveAllRooms(socket);
        }
      });
    } catch (error) {
      // Log any errors during connection setup
      console.error("Socket Connection error", error);

      // Inform the client about the internal error
      socket.emit("Internal_error", { error: "Internal server error" });
    }
  });
};
