const http = require("http");
const https = require("https");

// Simple proxy that forwards requests to a backend server
// This is a placeholder - in production, the Express app should run on the same Vercel instance

module.exports = (req, res) => {
  // For now, return a JSON response
  // In a real scenario, this would proxy to the Express backend
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ status: "ok", message: "API endpoint working" });
};
