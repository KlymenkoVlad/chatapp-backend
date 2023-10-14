import express, { Request } from "express";
const router = express.Router();

import authMiddleware from "../middlewares/authMiddleware.js";
import UserModel from "../models/UserModel.js";

type CustomRequest = Request & {
  username?: string;
  userId?: string;
};

router.get("/", authMiddleware, async (req: CustomRequest, res) => {
  try {
    const { username } = req.query;
    const { userId } = req;

    // Check if the input has at least two characters before creating the regex
    if (!username) {
      return res.status(400).json({
        message: "Please provide a username for the search.",
      });
    }

    // Create a regular expression for a case-insensitive partial search
    const searchRegex = new RegExp(username as string, "i");

    // Perform the user search based on the partial username and exclude the current user
    const users = await UserModel.find({
      _id: { $ne: userId },
      username: searchRegex,
    });

    // Filter the results to keep only users with at least two common characters
    const filteredUsers = users.filter((user) => {
      const commonCharacters = Array.from(username as string).filter((char) =>
        user.username.toLowerCase().includes(char.toLowerCase())
      );
      return commonCharacters.length >= 2;
    });

    if (!filteredUsers || filteredUsers.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
