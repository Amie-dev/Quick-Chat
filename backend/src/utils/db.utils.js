import mongoose from "mongoose";

const connectDB = async () => {
  const url = process.env.MONGO_URI;
  if (!url) {
    throw new Error("MONGO_URI is not defined");
  }

  try {
    await mongoose.connect(url, { dbName: "quick-chat" });
    console.log("DB connection successful");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
