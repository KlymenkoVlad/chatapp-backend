import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import authMiddleware from "../middlewares/authMiddleware.js";
import UserModel from "../models/UserModel.js";
import { validateEmail } from "../utils/validation.js";
//Find all matching users by username
router.get("/", authMiddleware, async (req, res) => {
    try {
        const { username } = req.query;
        const { userId } = req;
        // Check if the input has at least two characters before creating the regex
        if (!username || typeof username !== "string") {
            return res.status(400).json({
                message: "Please provide a username for the search.",
            });
        }
        // Create a regular expression for a case-insensitive partial search
        const searchRegex = new RegExp(username, "i");
        // Perform the user search based on the partial username and exclude the current user
        const users = await UserModel.find({
            _id: { $ne: userId },
            username: searchRegex,
        });
        // Filter the results to keep only users with at least two common characters
        const filteredUsers = users.filter((user) => {
            const commonCharacters = Array.from(username).filter((char) => user.username.toLowerCase().includes(char.toLowerCase()));
            return commonCharacters.length >= 2;
        });
        if (!filteredUsers || filteredUsers.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        res.status(200).json(filteredUsers);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
//Get user by id
router.get("/:userId", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
//Update user profile
router.put("/", authMiddleware, async (req, res) => {
    const { userId } = req;
    const { name, lastname, email, username, mainPicture } = req.body;
    const updateFields = {};
    if (email) {
        if (!validateEmail(email)) {
            return res.status(400).json({ error: "Invalid Email" });
        }
        const emailNotAvailable = await UserModel.findOne({
            email: email.toLowerCase(),
        });
        if (emailNotAvailable) {
            return res.status(400).json({ error: "This email is already taken" });
        }
        updateFields.email = email;
    }
    if (username) {
        const usernameNotAvailable = await UserModel.findOne({
            username,
        });
        if (usernameNotAvailable) {
            return res.status(400).json({ error: "This username is already taken" });
        }
        updateFields.username = username;
    }
    if (name && name.length > 1) {
        updateFields.name = name;
    }
    if (lastname && lastname.length > 1) {
        updateFields.lastname = lastname;
    }
    if (mainPicture) {
        updateFields.mainPicture = mainPicture;
    }
    try {
        const updatedUser = await UserModel.findOneAndUpdate({ _id: userId }, { $set: updateFields }, { new: true } // This option returns the updated document
        );
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error updating user" });
    }
});
//Update user password
router.post("/updatePassword", authMiddleware, async (req, res) => {
    try {
        const { userId } = req;
        const { oldPassword, newPassword } = req.body;
        const user = await UserModel.findById(userId).select("+password");
        const isNewPassword = await bcrypt.compare(newPassword, user.password);
        if (isNewPassword) {
            return res.status(400).send({ error: "Password is the same" });
        }
        const isPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isPassword) {
            return res.status(400).send({ error: "Invalid password" });
        }
        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();
        return res.status(200).send("Updated");
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error updating password" });
    }
});
export default router;
//# sourceMappingURL=user.js.map