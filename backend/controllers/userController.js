import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};