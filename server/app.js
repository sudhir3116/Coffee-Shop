const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const healthRoutes = require("./routes/healthRoutes");
const contactRoutes = require("./routes/contactRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const menuRoutes = require("./routes/menuRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

// Standard Middlewares in correct order
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/reviews", reviewRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
