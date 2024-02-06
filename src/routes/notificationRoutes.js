const express = require("express");
const notificationController = require("../controllers/notificationController");

const router = express.Router();


router.get("/notifications/:id", notificationController.getNotificationById);
router.post("/mark-as-read-notifications/:id", notificationController.markNorificationAsRead);
router.post("/mark-all-as-read-notifications/:id", notificationController.markAllNorificationAsRead);


module.exports = router;