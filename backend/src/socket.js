import { leaveAllRooms } from "./socket/helper.js";
import { notifyConversationOnlineStatus } from "./socket/socketConversation.js";

// Function to initialize socket connections and handle user presence

export const initializeSocket = async (io) => {
  // Listen for new client connections

  io.on("connection", async (socket) => {
    try {
      // Retrieve the authenticated user object attached in socketAuthMiddleware

      const user = socket.user;

      // Instead, log socket.id for clarity.

      console.log("User connected with socket id:", socket.id);

      console.log("User Connect", user._id);

      // Join a room named after the user's ID
      // This allows sending targeted events to this specific user

      socket.join(user._id.toString());

      // Notify all friends that this user is now online

      await notifyConversationOnlineStatus(io, socket, true);

      // Handle user disconnection

      socket.on("disconnect", async () => {
        // Notify all friends that this user is now offline
        await notifyConversationOnlineStatus(io, socket, false);

        // Clean up: remove the user from all rooms they joined
        leaveAllRooms(socket);
      });
    } catch (error) {
      // Log any errors during connection setup
      console.error("Socket Connection error", error);

      // Inform the client about the internal error
      socket.emit("Internal_error", { error: "Internal server error" });
    }
  });
};
