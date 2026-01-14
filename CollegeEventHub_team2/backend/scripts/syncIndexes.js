import mongoose from "mongoose";
import dotenv from "dotenv";

import Registration from "../models/registrationModel.js";
import Review from "../models/reviewModel.js";
import Event from "../models/eventModel.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to DB");

    await Event.syncIndexes();
    await Registration.syncIndexes();
    await Review.syncIndexes();

    console.log("Indexes synced successfully");
    process.exit(0);
  } catch (err) {
    console.error("Index sync failed:", err);
    process.exit(1);
  }
};

run();
