const express = require("express");
const cors = require("cors");

const app = express();

const authroutes = require("./routes/authroutes");
const sensorroutes = require("./routes/sensorroutes");
const deviceroutes = require("./routes/deviceroutes");
const farmRoutes = require("./routes/farmroutes");
const diseaseRoutes = require("./routes/diseaseroutes");

app.use(cors());

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/farms", farmRoutes);
app.use("/api/disease", diseaseRoutes);

app.get("/", (req, res) => {
    res.send("Crop Health API is running");
});

app.use("/api/auth", authroutes);
app.use("/api/sensors", sensorroutes);
app.use("/api/devices", deviceroutes);

module.exports = app;