const Notification = require("../models/notification");
const mongoose = require("mongoose");
const { emitNotification } = require("../service/notification");

console.log;

async function getNotificationById(req, res) {
  const { id } = req.params;

  const notifications = await Notification.find({ userId: id });
  if (!notifications) {
    res.status(400).json({ error: "No such notifications" });
  } else {
    res.status(200).json(notifications);
  }
}

async function markAllNorificationAsRead(req, res) {
  const { id } = req.params;

  const deletedNotification = await Notification.deleteMany({ userId: id });
  const notifications = await Notification.find({ userId: id });

  if (!notifications) {
    res.status(400).json([]);
  } else {
    res.status(200).json(notifications);
  }
}

async function markNorificationAsRead(req, res) {
  const { id } = req.params;

  const deletedNotification = await Notification.findOneAndDelete(
    { _id: id },
    { new: true }
  );
  if (!deletedNotification) {
    return res.status(404).json({ error: "Notification not found" });
  }
  const updatedNotifications = await Notification.find({
    userId: deletedNotification.userId,
  });

  if (!updatedNotifications || updatedNotifications.length === 0) {
    return res.status(400).json({ error: "No updated notifications found" });
  } else {
    res.status(200).json(updatedNotifications);
  }
}

async function sendNotificationToCounselor(counselorId, message, type) {
  try {
    // Create a new notification
    const notification = await Notification.create({
      userId: counselorId,
      message: message,
      type: type,
    });
    // Emit a socket event to notify the counselor
    emitNotification(counselorId, message);
  } catch (error) {}
}

module.exports = {
  getNotificationById,
  markAllNorificationAsRead,
  markNorificationAsRead,
  sendNotificationToCounselor,
};
