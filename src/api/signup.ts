import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserModel from "../models/UserModel.js";
import { validateEmail } from "../utils/validation.js";
import ChatModel from "../models/ChatModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { username, password, email } = req.body;
  if (!validateEmail(email)) {
    return res.status(401).json({ error: "Invalid Email" });
  }

  try {
    const emailNotAvailable = await UserModel.findOne({
      email: email.toLowerCase(),
    });
    const usernameNotAvailable = await UserModel.findOne({
      username,
    });

    if (emailNotAvailable) {
      return res.status(401).json({ error: "This email is already taken" });
    }
    if (usernameNotAvailable) {
      return res.status(401).json({ error: "This username is already taken" });
    }

    const user = await UserModel.create({
      username,
      email,
      password: await bcrypt.hash(password, 12),
    });

    await user.save();

    const payload = { userId: user._id };

    if (!process.env.JWT_SECRET) {
      throw new Error("No JWT_SECRET specified in env, please add it!");
    }

    await new ChatModel({ user: user._id, chats: [] }).save();

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "14d" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token });
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

export default router;
