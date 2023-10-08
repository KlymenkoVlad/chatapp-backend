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
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UserModel = require("../models/UserModel");
const { validateEmail } = require("../utils/validation");
const router = express.Router();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email } = req.body;
    if (!validateEmail(email)) {
        return res.status(401).json({ error: "Invalid Email" });
    }
    try {
        const emailNotAvailable = yield UserModel.findOne({
            email: email.toLowerCase(),
        });
        const usernameNotAvailable = yield UserModel.findOne({
            username,
        });
        if (emailNotAvailable) {
            return res.status(401).json({ error: "This email is already taken" });
        }
        if (usernameNotAvailable) {
            return res.status(401).json({ error: "This username is already taken" });
        }
        const user = yield UserModel.create({
            username,
            email,
            password: yield bcrypt.hash(password, 12),
        });
        yield user.save();
        const payload = { userId: user._id };
        if (!process.env.JWT_SECRET) {
            throw new Error("No JWT_SECRET specified in env, please add it!");
        }
        // jwt.sign(
        //   payload,
        //   process.env.JWT_SECRET,
        //   { expiresIn: "14d" },
        //   (err, token) => {
        //     if (err) throw err;
        //     res.status(200).json(token);
        //   }
        // );
    }
    catch (error) {
        console.error(error);
        return res.status(500).send("Server error");
    }
}));
module.exports = router;
