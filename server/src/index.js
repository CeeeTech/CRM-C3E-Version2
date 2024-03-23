// const http = require("http");
const https = require("https");
const http = require("http");

const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectToDatabase = require("../database");
const studentRoutes = require("./routes/studentRoutes");
const user_typeRoutes = require("./routes/user_typeRoutes");
const userRoutes = require("./routes/userRoutes");
const leadRoutes = require("./routes/leadRoutes");
const branchRoutes = require("./routes/branchRoutes");
const courseRoutes = require("./routes/courseRoutes");
const statusRoutes = require("./routes/statusRoutes");
const folowUpRoutes = require("./routes/folowUpRoutes");
const sourceRoutes = require("./routes/sourceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const counsellorAssignmentRoutes = require("./routes/counsellorAssignmentRoutes");
const messageTemplateRoutes = require("./routes/messageTemplateRoutes");
const requireAuth = require("./middleware/requireAuth");
const logFunctionExecution = require("./middleware/log");
const socketIo = require("socket.io");
const moment = require("moment-timezone");

process.env.TZ = "Asia/Colombo";

const app = express();
app.use(cors());

const port = 8081;

// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectToDatabase();

// Set up your routes here
app.get("/", (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello, world CEEE!");
});

// middleware to handle logging of function execution
app.use(logFunctionExecution);

// Apply requireAuth middleware globally for all routes
app.use((req, res, next) => {
  // Exclude login route from authentication
  if (req.path === "/api/login") {
    return next();
  }
  if (req.path === "/api/fbleads") {
    return next();
  }
  if (req.path === "/api/fbleads-health") {
    return next();
  }
  if (req.path === "/api/test-leads") {
    return next();
  }
  if (req.path === "/api/fbtestaddlead") {
    return next();
  }
  if (req.path === "/api/add-lead-api") {
    return next();
  }
  if (req.path === "/api/add-lead-with-existing-student-api") {
    return next();
  }
  if (req.path === "/api/check-duplicate-email-api") {
    return next();
  }
  return next();

  //requireAuth(req, res, next);
});

// Use the student routes
app.use("/api", user_typeRoutes);
app.use("/api", studentRoutes);
app.use("/api", userRoutes);
app.use("/api", leadRoutes);
app.use("/api", branchRoutes);
app.use("/api", courseRoutes);
app.use("/api", statusRoutes);
app.use("/api", folowUpRoutes);
app.use("/api", sourceRoutes);
app.use("/api", counsellorAssignmentRoutes);
app.use("/api", notificationRoutes);
app.use("/api", messageTemplateRoutes);

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "../server.key")),
  cert: fs.readFileSync(path.join(__dirname, "../server.cert")),
};

// Create an HTTP server and listen on the specified port
const server = http.createServer(app);
const io = socketIo(server, {
  transports: ["polling"],
  cors: {
    origin: [
      "https://localhost:3000",
      "http://localhost:3000",
      "http://localhost",
      "http://localhost/build/",
    ],
  },
});

const { initializeSocket } = require("./service/notification");
initializeSocket(io);
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
