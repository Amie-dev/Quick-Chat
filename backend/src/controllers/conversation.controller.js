import mongoose from "mongoose";
import FriendShip from "../models/frienShip.model.js";
import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import RedisService from "../services/RedisService.js";

class ConversationController {
  // Controller method to check if a connect code is valid for creating a friendship
  static async checkConnectCode(req, res) {
    try {
      // 1. Get the current user's ID from the request (set by authentication middleware)
      const userId = req.user._id;

      // 2. Extract the connect code from the query string (?connectCode=XYZ)
      const { connectCode } = req.query;

      // 3. Look up a user with this connect code
      const friend = await User.findOne({ connectCode });

      // 4. Validate:
      //    - If no user exists with this code
      //    - OR if the code belongs to the current user (can't connect to yourself)
      if (!friend || friend._id.toString() === userId.toString()) {
        return res.status(400).json({
          message: "Invalid connect code",
        });
      }

      // 5. Check if a friendship already exists between the current user and the friend
      const existingFriendShip = await FriendShip.findOne({
        $or: [
          // Case A: current user is recipient, friend is requester
          {
            recipient: new mongoose.Types.ObjectId(userId),
            requester: friend._id,
          },
          // Case B: current user is requester, friend is recipient
          {
            recipient: friend._id,
            requester: new mongoose.Types.ObjectId(userId),
          },
        ],
      });

      // 6. If a friendship already exists, reject the request
      if (existingFriendShip) {
        return res.status(400).json({
          message: "Friendship already exists",
        });
      }

      // 7. If all checks pass, the connect code is valid
      res.status(200).json({
        message: "Code is valid",
      });
    } catch (error) {
      // 8. Handle unexpected errors gracefully
      console.error("Error checking connect code", error);
      res.status(500).json({
        message: "Internal server error in checking connect code",
      });
    }
  }

  // Controller method to get all conversations for the logged-in user
  static async getConversation(req, res) {
    try {
      // 1. Extract the current user's ID from the request object
      const userId = req.user._id;

      // 2. Find all friendships where the user is either the requester or recipient
      //    This gives us all the user's friends
      const friendShips = await FriendShip.find({
        $or: [
          { recipient: new mongoose.Types.ObjectId(userId) },
          { requester: new mongoose.Types.ObjectId(userId) },
        ],
      })
        // Populate requester and recipient fields with selected user info
        .populate([
          { path: "recipient", select: "_id fullName userName connectCode" },
          { path: "requester", select: "_id fullName userName connectCode" },
        ])
        .lean(); // Convert Mongoose docs to plain JS objects

      // 3. If the user has no friendships, return an empty list
      if (!friendShips.length) {
        return res.status(400).json({ data: [] });
      }

      // 4. Extract all friend IDs (the other person in each friendship)
      const friendIds = friendShips.map((friend) =>
        friend.requester._id.toString() === userId.toString()
          ? friend.recipient._id.toString()
          : friend.requester._id.toString(),
      );

      // 5. Find all conversations that include the user and exactly one friend
      //    - $all ensures both userId and friendId are in participants
      //    - size(2) ensures it's a one-to-one conversation (not group chat)
      const conversations = await Conversation.find({
        participants: { $all: [userId], $in: friendIds },
      })
        .where("participants")
        .size(2);

      // 6. Create a map (friendId -> conversation) for quick lookup
      const conversationsMap = new Map();
      conversations.forEach((conversation) => {
        // Find the friend (the participant who is not the current user)
        const friendId = conversation.participants.find(
          (p) => p.toString() !== userId.toString(),
        );
        conversationsMap.set(friendId.toString(), conversation);
      });

      // 7. Build the response data for each friendship
      const conversationsData = await Promise.all(
        friendShips.map(async (friendShip) => {
          // Determine who is the friend (not the current user)
          const isRequester =
            friendShip.requester._id.toString() === userId.toString();
          const friend = isRequester
            ? friendShip.recipient
            : friendShip.requester;

          // Get the conversation with this friend (if any)
          const conversation = conversationsMap.get(friend._id.toString());

          return {
            // Conversation details
            conversationId: conversation?._id || null,
            lastMessage: conversation?.lastMessagePreview || null,

            // Unread message counts for both participants
            unreadCounts: {
              [friendShip.requester._id.toString()]:
                conversation?.unreadCounts?.[
                  friendShip.requester._id.toString()
                ] || 0,
              [friendShip.recipient._id.toString()]:
                conversation?.unreadCounts?.[
                  friendShip.recipient._id.toString()
                ] || 0,
            },

            // Friend details
            friend: {
              _id: friend._id.toString(),
              userName: friend.userName,
              fullName: friend.fullName,
              online: await RedisService.isUserOnline(friend._id.toString()), // integrate Redis service to check online status
            },
          };
        }),
      );

      // 8. Send the final response back to the client
      res.status(200).json({ data: conversationsData });
    } catch (error) {
      // 9. Handle errors gracefully
      console.error("Error fetching conversations", error);
      res.status(500).json({
        message: "Internal server error in getConversations controller",
      });
    }
  }
}

export default ConversationController;
