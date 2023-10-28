import mongoose from "mongoose";
export default async function connectDb() {
    if (!process.env.MONGO_URL) {
        throw new Error("No MONGO_URL specified in env, please add it!");
    }
    try {
        await mongoose.connect(process.env.MONGO_URL, {});
        console.warn("Mongodb connected");
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}
//# sourceMappingURL=connectDb.js.map