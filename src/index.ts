import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";

const app = express();

// API IMPORTS
import signup from "./api/signup.js";
import login from "./api/login.js";
import connectDb from "./utils/connectDb.js";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 3001;

connectDb();

app.use(bodyParser.json());

app.use(cors());

app.options("*", cors());

app.use("/api/signup", signup);
app.use("/api/login", login);

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
