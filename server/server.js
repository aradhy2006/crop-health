require("dotenv").config(); 
const app = require("./app");
const connectdb = require("./config/database");

// Use env PORT or default to 5000
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectdb();

// Listen on the dynamic PORT
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});