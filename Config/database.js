import mongoose from "mongoose";
export const connectToDB = async () => {
  const { connection } = await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to Database with ${connection.host}`);
};
