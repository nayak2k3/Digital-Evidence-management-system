import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Hash common password
    const hashedPassword = await bcrypt.hash(
      "123456",
      10
    );

    // Create users
    const users = [
      {
        name: "Super Admin",
        email: "superadmin@example.com",
        password: hashedPassword,
        role: "superadmin", 
      },

      {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      },

      {
        name: "Investigator User",
        email: "investigator@example.com",
        password: hashedPassword,
        role: "investigator",
      },

      {
        name: "Forensic Analyst",
        email: "forensic@example.com",
        password: hashedPassword,
        role: "forensic_analyst",
      },

      {
        name: "Nagendra",
        email: "nagendraokulr@gmail.com",
        password: hashedPassword,
        role: "viewer",
      },
    ];

    await Promise.all(
      users.map(({ email, ...user }) =>
        User.updateOne(
          { email },
          {
            $set: {
              ...user,
              isActive: true,
            },
            $setOnInsert: { email },
          },
          { upsert: true, runValidators: true }
        )
      )
    );

    console.log("====================================");
    console.log("Users seeded successfully");
    console.log("====================================");

    console.log("Superadmin:");
    console.log("superadmin@example.com / 123456");

    console.log("Admin:");
    console.log("admin@example.com / 123456");

    console.log("Investigator:");
    console.log("investigator@example.com / 123456");

    console.log("Forensic Analyst:");
    console.log("forensic@example.com / 123456");

    console.log("Viewer:");
    console.log("nagendraokulr@gmail.com / 123456");

    console.log("====================================");

    process.exit(0);
  } catch (error) {
    console.error(
      "Seed failed:",
      error.message
    );

    process.exit(1);
  }
};

seedUsers();  