const express = require("express");
const cors = require("cors");
const app = express();
const farmRoutes = require("./routes/farmroutes");
const authroutes=require("./routes/authroutes");
const diseaseRoutes =require("./routes/diseaseroutes");
app.use(cors());
app.use(express.json());
app.use("/api/farms", farmRoutes);
app.use("/api/disease", diseaseRoutes);
app.get("/", (req, res) => {
    res.send("Crop Health API is running");
});
app.use("/api/auth",authroutes);
module.exports = app;