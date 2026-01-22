import FriendShip from "../models/frienShip.model.js";

// Function to notify all friends of a user when their online status changes
export const notifyConversationOnlineStatus = async (io, socket, online) => {
  try {
    // Extract the current user's ID and user object from the socket

    const userId = socket.userId;

    const user = socket.user; // already attached in socketAuthMiddleware

    // Find all friendships where the current user is either the requester or recipient

    const friendships = await FriendShip.find({
      $or: [{ requester: userId }, { recipient: userId }],
    }).populate("requester recipient"); // populate to get full user objects

    // Loop through each friendship to notify the other party

    friendships.forEach((friendship) => {
      // Check if the current user is the requester in this friendship
      const isRequester =
        friendship.requester._id.toString() === userId.toString();

      // Determine the friend's user object (the other side of the friendship)
      const friend = isRequester ? friendship.recipient : friendship.requester;

      // Log for debugging

      console.log("emit:conversation:online-status");

      // Emit an event to the friend's room (identified by their userId)
      // This assumes each user has joined a room named after their own userId

      console.log("Emitting online status", {
        friendId: userId,
        userName: user.userName,
        online,
      });
      io.to(friend._id.toString()).emit("conversation:online-status", {
        friendId: userId, // ID of the user whose status changed
        userName: user.userName, // Username of the user whose status changed
        online, // Boolean: true if online, false if offline
      });
    });
  } catch (error) {
    // Catch and log any errors during the process
    console.error("notifyConversationOnlineStatus error:", error);
  }
};
