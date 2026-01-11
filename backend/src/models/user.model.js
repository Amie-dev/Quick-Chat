import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    connectCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
    },
    userName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    refreshToken: {
      type: String,
    },
    // accessToken: {
    //   type: String,
    // },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
