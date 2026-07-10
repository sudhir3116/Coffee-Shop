const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Coffee Shop API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV
  });
});

module.exports = router;
