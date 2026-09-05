require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authroutes");
const farmRoutes = require("./routes/farmroutes");
const diseaseRoutes = require("./routes/diseaseroutes");
const sensorRoutes = require("./routes/sensorroutes");

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication
app.use("/api/auth", authRoutes);

// Farms
app.use("/api/farms", farmRoutes);

// Disease Detection
app.use("/api/disease", diseaseRoutes);

// Sensor Data
app.use("/api/sensors", sensorRoutes);

module.exports = app;