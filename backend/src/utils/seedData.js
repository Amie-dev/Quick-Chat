import dotenv from "dotenv"
dotenv.config();
import axios from "axios"
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./db.utils.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import FriendShip from "../models/frienShip.model.js";
import User from "../models/user.model.js";



async function resetDatabase() {
    try {
        await connectDB();
        await Message.deleteMany({});
        await Conversation.deleteMany({});
        await FriendShip.deleteMany({});
        await User.deleteMany({});
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error resetting the database:", error);
        await mongoose.disconnect();
    }
}

async function seed() {
    try {
        await resetDatabase();
        await connectDB();

        const usersData = [
            {
                fullName: 'John',
                userName: 'john',
                email: 'test@test.com',
                connectCode: "111111",
            },
            {
                fullName: 'Bob',
                userName: 'bob',
                email: 'test2@test.com',
                connectCode: "222222",
            }
        ];

        // create users
        const users = [];
        const hashPassword = await bcrypt.hash("password", 10);

        for (const data of usersData) {
            data.password = hashPassword;
            const user = await User.create(data);
            console.log(`User created ${user.fullName} (${user.id})`);
            users.push(user);
        }

        const [user1, user2] = users;

        // create friendships
        const friendship = await FriendShip.create({
            requester: user1._id,
            recipient: user2._id,
        })
        console.log(`Friendship created: ${friendship.id}`);

        // create conversation
        const conversation = await Conversation.create({
            participants: [user1._id, user2._id],
            lastMessagePreview: null,
            unreadCounts: {
                [user1._id]: 0,
                [user2._id]: 0,
            }
        })
        console.log(`Conversation created ${conversation.id}`);

        const messages = [];
        for (let i = 0; i < 30; i++) {
            const sender = i % 2 === 0 ? user1 : user2;
            const content = `Message ${i + 1} from ${sender.userName}`;
            const message = await Message.create({
                sender,
                content: content,
                conversation: conversation._id,
            });
            messages.push(message);
        }
        const lastMessage = messages[messages.length - 1];



        conversation.unreadCounts.set(user2._id.toString(), lastMessage.sender.equals(user2._id) ? 0 : 1);
        conversation.unreadCounts.set(user1._id.toString(), lastMessage.sender.equals(user1._id) ? 0 : 1);
        await conversation.save();

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");

    } catch (error) {
        console.error("Error seeding database:", error);
        await mongoose.disconnect();
    }
}

seed();