"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UserModel = require("../models/UserModel.js");
const { validateEmail } = require("../utils/validation.js");
const authMiddleware = require("../middlewares/authMiddleware.js");
router.get("/", authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    try {
        const user = yield UserModel.findById(userId).select("-__v");
        return res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        return res.status(500).send("Server error");
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!validateEmail(email)) {
        return res.status(401).send("Invalid email");
    }
    if (!process.env.JWT_SECRET) {
        throw new Error("No JWT_SECRET specified in env, please add it!");
    }
    try {
        const user = yield UserModel.findOne({ email: email.toLowerCase() }).select("+password");
        if (!user) {
            return res.status(401).json({ error: "No such user" });
        }
        const isPassword = yield bcrypt.compare(password, user.password);
        if (!isPassword) {
            return res.status(401).json({ error: "Invalid credential" });
        }
        const payload = { userId: user._id };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "14d" }, (err, token) => {
            if (err)
                throw err;
            res.status(200).json(token);
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send("Server error");
    }
}));
module.exports = router;
