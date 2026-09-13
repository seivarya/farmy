const FarmerNotification = require("../models/FarmerNotification");
const { sendError, sendSuccess } = require("../utils/http");

const listMyNotifications = async (req, res) => {
  const notifications = await FarmerNotification.find({ farmerId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  return sendSuccess(res, 200, {
    unreadCount,
    notifications,
  });
};

const markNotificationAsRead = async (req, res) => {
  const notification = await FarmerNotification.findOneAndUpdate(
    {
      _id: req.params.id,
      farmerId: req.user.id,
    },
    { readAt: new Date() },
    { new: true },
  );

  if (!notification) {
    return sendError(res, 404, "Notification not found.");
  }

  return sendSuccess(res, 200, { notification });
};

module.exports = {
  listMyNotifications,
  markNotificationAsRead,
};
