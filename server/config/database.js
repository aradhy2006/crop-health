const mongoose = require("mongoose");
const dns = require("dns");

// Set IPv4 preference
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // Ignore in environments where not supported
}

// Only override system DNS if explicitly configured in environment
if (process.env.USE_CUSTOM_DNS === "true") {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch (e) {
    console.warn("Could not set custom DNS servers:", e.message);
  }
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

module.exports = connectDB;