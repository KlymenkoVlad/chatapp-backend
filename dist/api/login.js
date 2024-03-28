import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserModel from "../models/UserModel.js";
import { validateEmail } from "../utils/validation.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();
//Get user by authorization token
router.get("/", authMiddleware, async (req, res) => {
    const { userId } = req;
    try {
        const user = await UserModel.findById(userId).select("-__v");
        return res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        return res.status(500).send("Server error");
    }
});
//Login
router.post("/", async (req, res) => {
    const { email, password } = req.body;
    if (!validateEmail(email)) {
        return res.status(401).send("Invalid email");
    }
    if (!process.env.JWT_SECRET) {
        throw new Error("No JWT_SECRET specified in env, please add it!");
    }
    try {
        const user = await UserModel.findOne({ email: email.toLowerCase() }).select("+password");
        if (!user) {
            return res.status(401).json({ error: "No such user" });
        }
        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword) {
            return res.status(401).json({ error: "Invalid credential" });
        }
        const payload = { userId: user._id };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "14d" }, (err, token) => {
            if (err)
                throw err;
            res.status(200).json({ token });
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send("Server error");
    }
});
export default router;
//# sourceMappingURL=login.js.map