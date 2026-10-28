import User from "../models/User.js";
import createNotification from "./createNotification.js";

const notifyUsersByRole = async ({
  roles,
  title,
  message,
  type,
  resourceType,
  resourceId,
}) => {
  try {
    const users = await User.find({
      role: {
        $in: roles,
      },
      isActive: true,
    }).select("_id");

    for (const user of users) {
      await createNotification({
        recipient: user._id,
        title,
        message,
        type,
        resourceType,
        resourceId,
      });
    }
  } catch (error) {
    console.error(
      "Failed to notify users:",
      error.message
    );
  }
};

export default notifyUsersByRole;