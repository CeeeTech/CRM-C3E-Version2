require("dotenv").config();
const mongoose = require("mongoose");


async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    //runBackgroundTask();
    console.log("Connected to MongoDB");

    
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit the process if there's an error
  }
}






// Start the initial execution

module.exports = connectToDatabase;
