require("dotenv").config();
const mongoose = require("mongoose");
const { Worker } = require('worker_threads');


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
function runBackgroundTask() {
  const worker = new Worker('./src/service/leadAllocationWorker.js'); // Use the current file as the worker script
  worker.on('message', (message) => {
    console.log('Background task completed:', message);
  });
  worker.on('error', (error) => {
    console.error('Background task error:', error);
  });
  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error('Background task exited with error code:', code);
    }
  });
}





// Start the initial execution

module.exports = connectToDatabase;
