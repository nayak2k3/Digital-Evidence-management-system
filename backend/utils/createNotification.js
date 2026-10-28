import Notification from "../models/Notification.js";

const createNotification = async ({
  recipient,
  title,
  message,
  type,
  resourceType = "System",
  resourceId = null,
}) => {
  try {
    await Notification.create({
      recipient,
      title,
      message,
      type,
      resourceType,
      resourceId,
    });
  } catch (error) {
    console.error(
      "Failed to create notification:",
      error.message
    );
  }
};

export default createNotification;