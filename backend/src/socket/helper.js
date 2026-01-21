// Generate a consistent chat room name for two users
export const getChatRoom = (userId1, userId2) => {
  // Convert IDs to strings and sort them to ensure consistent ordering
  const sortedIds = [userId1.toString(), userId2.toString()].sort();

  // Use index 0 and 1 (not 2!) to build the room name
  return `chat_${sortedIds[0]}_${sortedIds[1]}`;
};

// Remove the socket from all chat-related rooms
export const leaveAllRooms = (socket) => {
  // Get all rooms the socket is currently in
  const rooms = Array.from(socket?.rooms ?? []);

  // Leave only rooms that start with "chat_"
  rooms.forEach((room) => {
    if (room.startsWith("chat_")) {
      socket.leave(room);
    }
  });
};
