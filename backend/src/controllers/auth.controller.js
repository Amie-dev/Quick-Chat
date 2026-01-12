import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { customAlphabet } from "nanoid";
import jwt from "jsonwebtoken";

const nanoId = (length) => {
  const generator = customAlphabet("1234567890", length);
  return generator();
};

class AuthController {
  static async register(req, res) {
    try {
      const { fullName, userName, email, password } = req.body;

      if (!fullName || !email || !userName || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long" });
      }

      const userExist = await User.findOne({
        $or: [{ email }, { userName }],
      });

      if (userExist) {
        return res.status(400).json({
          message:
            "User already exists with this email or username, please log in",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        email,
        userName,
        fullName,
        password: hashPassword,
        connectCode: nanoId(6),
      });

      await newUser.save();

      return res.status(201).json({
        user: {
          _id: newUser._id,
          userName: newUser.userName,
          email: newUser.email,
          fullName: newUser.fullName,
          connectCode: newUser.connectCode, // consistent naming
        },
      });
    } catch (error) {
      console.error("Register Error", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  static async logIn(req, res) {
    try {
      const { email, userName, password } = req.body || {};

      if (!email && !userName) {
        return res
          .status(400)
          .json({ message: "Email or username is required" });
      }

      if (!password || password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long" });
      }

      const user = await User.findOne({
        $or: [{ email }, { userName }],
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid email/username or password" });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res
          .status(400)
          .json({ message: "Invalid email/username or password" });
      }

      const token = jwt.sign(
        { _id: user._id, fullName: user.fullName, userName: user.userName },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      });

      return res.status(200).json({
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          connectCode: user.connectCode,
        },
      });
    } catch (error) {
      console.error("Login Error", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  static async logOut(req, res) {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
      });
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout Error", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async me(req, res) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "User is not logged in" });
      }

      const user = await User.findById(req.user._id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error("Me endpoint error", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default AuthController;
