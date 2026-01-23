import mongoose from "mongoose";

const friendShipSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "blocked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

friendShipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

friendShipSchema.pre("save", function(next) {
  if (this.requester.toString() === this.recipient.toString()) {
    return next(new Error("Requester and recipient cannot be the same user."));
  }

  const ids = [this.requester.toString(), this.recipient.toString()].sort();
  this.requester = mongoose.Types.ObjectId(ids[0]);
  this.recipient = mongoose.Types.ObjectId(ids[1]);

  next();
});

const FriendShip = mongoose.model("FriendShip", friendShipSchema);

export default FriendShip;
