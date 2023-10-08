"use strict";
const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).send("Unauthorized");
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("No JWT_SECRET specified in env, please add it!");
        }
        const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        req.userId = userId;
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(401).send("Unauthorized");
    }
};
