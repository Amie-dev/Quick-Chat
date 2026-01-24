import { Schema, model } from "mongoose";

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      index: true,
    },
    lastMessagePreview: {
      content: String,
      timestamp: Date, // fixed typo
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index(
  { "participants.0": 1, "participants.1": 1 },
  { unique: true }
);

conversationSchema.pre("save", async function () {
  if (this.participants && this.participants.length === 2) {
    this.participants = this.participants.map(p => p.toString()).sort();
  }
});


const Conversation = model("Conversation", conversationSchema);

export default Conversation;
