require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

function getArg(name) {
  const arg = process.argv.find((value) => value.startsWith(`--${name}=`));
  return arg ? arg.split("=").slice(1).join("=") : "";
}

async function run() {
  const mongoUri = process.env.MONGO_URI;
  const name = getArg("name") || process.env.ADMIN_NAME || "ScoreApp Admin";
  const email = getArg("email") || process.env.ADMIN_EMAIL;
  const password = getArg("password") || process.env.ADMIN_PASSWORD;

  if (!mongoUri) {
    throw new Error("MONGO_URI is required in backend/.env to seed an admin user");
  }

  if (!email || !password) {
    throw new Error(
      "Admin email and password are required. Pass --email and --password or set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env"
    );
  }

  if (password.length < 6) {
    throw new Error("Admin password must be at least 6 characters");
  }

  await mongoose.connect(mongoUri);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists for email: ${email}`);
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });
  console.log(`Admin created: ${user.email}`);
}

run()
  .catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
