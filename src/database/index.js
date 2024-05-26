import mongoose from "mongoose";
import { DB_NAME, DB_URI } from "../config/index.js";

export const connectDB = async () => {
  try {
    const dbInstance = await mongoose.connect(`${DB_URI}/${DB_NAME}`);
    console.log(
      "Success : MongoDB connected successfully\nHOST - ",
      dbInstance.connection.host
    );
  } catch (error) {
    console.error("Error : MongoDB connection failed - ", error);
    process.exit(1);
  }
};
