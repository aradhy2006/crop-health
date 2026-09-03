const express = require("express");
const { register, login, getMe } = require("../controllers/authcontrollers");
const authmiddleware = require("../middleware/authmiddleware"); // <-- Removed curly braces

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authmiddleware, getMe);

module.exports = router;