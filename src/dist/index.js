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
const app = express();
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
// API IMPORTS
const signup = require("./api/signup");
const login = require("./api/login");
function connectDb() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!process.env.MONGO_URL) {
            throw new Error("No MONGO_URL specified in env, please add it!");
        }
        try {
            yield mongoose.connect(process.env.MONGO_URL, {});
            console.warn("Mongodb connected");
        }
        catch (error) {
            console.error(error);
            process.exit(1);
        }
    });
}
dotenv.config({ path: "./.env" });
connectDb();
app.use(bodyParser.json());
app.use(cors());
app.options("*", cors());
app.use("/api/signup", signup);
app.use("/api/login", login);
app.listen(3001, () => {
    console.warn(`Express server running on ${3001}`);
});
