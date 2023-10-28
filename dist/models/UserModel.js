import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastname: { type: String, required: false, default: undefined },
    mainPicture: { type: String, required: false, default: undefined },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true, select: false },
    email: { type: String, required: true, unique: true },
}, { timestamps: true });
const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
//# sourceMappingURL=UserModel.js.map