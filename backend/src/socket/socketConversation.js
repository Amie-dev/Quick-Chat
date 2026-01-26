import Conversation from "../models/conversation.model.js";
import FriendShip from "../models/frienShip.model.js";
import User from "../models/user.model.js";
import RedisService from "../services/RedisService.js";
import { getChatRoom } from "./helper.js";

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

      const room=getChatRoom(userId.toString(),friend._id.toString())

      socket.join(room)
      // Log for debugging

      console.log("emit:conversation:online-status");

      // Emit an event to the friend's room (identified by their userId)
      // This assumes each user has joined a room named after their own userId

      // console.log("Emitting online status", {
      //   friendId: userId,
      //   userName: user.userName,
      //   online,
      // });
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
export const conversationRequest = async (io, socket, data) => {
  try {
    const userId = socket.userId;
    const user = socket.user;
    const { connectCode } = data;

    const friend = await User.findOne({ connectCode });

    if (!friend) {
      socket.emit("conversation:request:error", {
        error: "Unable to find conversations",
      });
      return;
    }

    if (friend._id.toString() === userId.toString()) {
      socket.emit("conversation:request:error", {
        error: "Can not add yourself as friend",
      });
      return;
    }

    // Check if friendship already exists
    const existingFriendShip = await FriendShip.findOne({
      $or: [
        { requester: userId.toString(), recipient: friend._id.toString() },
        { requester: friend._id.toString(), recipient: userId.toString() },
      ],
    });

    if (existingFriendShip) {
      socket.emit("conversation:request:error", { error: "already exist" });
      return;
    }

    // Create friendship
    await FriendShip.create({
      requester: userId,
      recipient: friend._id,
    });

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId.toString(), friend._id.toString()] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId.toString(), friend._id.toString()],
      });
    }

    socket.join(getChatRoom(userId, friend._id.toString()));

    // Build normalized payload
    const requesterPayload = {
      conversationId: conversation._id.toString(),
      friend: {
        _id: friend._id.toString(),
        userName: friend.userName,
        fullName: friend.fullName,
        online: await RedisService.isUserOnline(friend._id.toString()),
      },
      unreadCounts: {
        [userId.toString()]: 0,
        [friend._id.toString()]: 0,
      },
      lastMessage: null,
    };

    const recipientPayload = {
      conversationId: conversation._id.toString(),
      friend: {
        _id: user._id.toString(),
        userName: user.userName,
        fullName: user.fullName,
        online: await RedisService.isUserOnline(user._id.toString()),
      },
      unreadCounts: {
        [userId.toString()]: 0,
        [friend._id.toString()]: 0,
      },
      lastMessage: null,
    };

    // Emit normalized payloads
    io.to(userId.toString()).emit("conversation:accept", requesterPayload);
    io.to(friend._id.toString()).emit("conversation:accept", recipientPayload);

    console.log(`Conversation: ${conversation._id}`);
  } catch (error) {
    console.error("Error conversation:request", error);
    socket.emit("conversation:request:error", {
      error: "Error conversation:request",
    });
  }
};

//conversations mark
export const conversationMarkAsRead = async (io, socket, data) => {
  try {
    const { conversationId, friendId } = data;
    const userId = socket.userId;
    const friendShip = await FriendShip.findOne({
      $or: [
        { requester: userId, recipient: friendId },
        {
          requester: friendId,
          recipient: userId,
        },
      ],
    });

    // conversation:mark-as-read

    if (!friendShip) {
      socket.emit("conversation:mark-as-read:error", {
        error: "No Friend Found",
      });
      return;
    }

    const conversation=await Conversation.findById(conversationId)

    if (!conversation) {
      socket.emit("conversation:mark-as-read:error",{error:"No Conversations Found"})
      return;
    }

    conversation.unreadCounts.set(userId.toString(),0);
    await conversation.save();


    const room=getChatRoom(userId.toString(),friendId.toString())
    io.to(room).emit("conversation:update-unread-counts",{
      conversationId:conversation._id.toString(),
      unreadCounts:{
        [userId.toString()]:0,
        [friendId.toString()]:conversation.unreadCounts.get(friendId)||0
      }
    })

  } catch (error) {
    console.error("Error Marking conversations as read ", error);
    socket.emit("conversation:mark-as-read:error", {
      error: "Error : conversation:mark-as-read:error",
    });
  }
};
