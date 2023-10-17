import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: false, default: undefined },
    surname: { type: String, required: false, default: undefined },
    profilePicUrl: { type: String, required: false, default: undefined },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true, select: false },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
